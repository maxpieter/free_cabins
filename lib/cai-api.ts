import { query } from "./db";

export interface CAIShelter {
  id: number;
  id_cai: number;
  title: string;
  geo: {
    type: "Point";
    coordinates: [number, number];
  };
  updated_at: string;
  fields: Array<{
    name: string;
    value: string;
  }>;
  media?: Array<{
    id: number;
    original_url: string;
    preview_url: string;
    name: string;
    file_name: string;
  }>;
}

interface CAIShelterSearchResponse {
  fields: string[];
  facets: Record<string, Record<string, number>>;
  queryParams: Array<any>;
  results: {
    current_page: number;
    data: CAIShelter[];
    first_page_url: string;
    from: number;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
  };
}

export async function fetchAllCAI(): Promise<CAIShelter[]> {
  const allShelters: CAIShelter[] = [];
  let page = 1;
  let keepFetching = true;

  while (keepFetching) {
    const url = `https://rifugi.cai.it/api/v1/shelters/search?page=${page}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`Failed to fetch page ${page}: ${res.statusText}`);
    }

    const data: CAIShelterSearchResponse = await res.json();

    const currentResults = data.results.data || [];
    allShelters.push(...currentResults);

    if (!data.results.next_page_url) {
      keepFetching = false;
    } else {
      page++;
      await new Promise((res) => setTimeout(res, 250)); // throttle
    }
  }

  return allShelters;
}

function getField(
  fields: CAIShelter["fields"],
  name: string
): string | undefined {
  return fields.find((f) => f.name === name)?.value;
}

export async function importCAIToDatabase(
  shelters: CAIShelter[]
): Promise<number> {
  let count = 0;

  for (const shelter of shelters) {
    const f = shelter.fields;

    let originalType = getField(f, "type") || null;

    let mappedType: string | null = null;
    switch (originalType) {
      case "Bivacco":
      case "Punto d'appoggio":
        mappedType = "shelter";
        break;
      case "Rifugio custodito":
        mappedType = "manned hut";
        break;
      case "Rifugio incustodito":
      case "Capanna sociale":
        mappedType = "unattended hut";
        break;
      default:
        mappedType = null;
    }
    const acqua = getField(f, "acqua_in_rifugio_service");
    const electricity = getField(f, "elettricita_service");
    const amenities: string[] = [];

    if (acqua) if (acqua === "1") amenities.push("water");
    if (electricity === "1") amenities.push("electricity");

    const localId = `cai-${shelter.id_cai}`;
    const isShelter = mappedType === "shelter";

    const cabin = {
      local_id: localId,
      name: (getField(f, "alias") || shelter.title)
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      country: "Italy",
      region: getField(f, "region_geo") || null,
      municipality: getField(f, "municipality_geo") || null,
      latitude: shelter.geo.coordinates[1],
      longitude: shelter.geo.coordinates[0],
      altitude: Number(getField(f, "altitude_geo") || 0),
      capacity: Number(getField(f, "posti_totali_service") || 1),
      amenities,
      isFree: mappedType?.toLowerCase().includes("shelter") || false,
      requiresBooking: !isShelter,
      mappedType,
      email: getField(f, "emailAddress") || null,
      phone: getField(f, "fixedPhone_property") || null,
      website:
        getField(f, "webSite_management_property") ||
        getField(f, "webAddress_contact") ||
        null,
      facebook: getField(f, "facebook_contact") || null,
      instagram: getField(f, "instagram_contact") || null,
      description: getField(f, "description_geo") || null,
      lastUpdated: new Date(shelter.updated_at)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "),
    };

    // Insert/Update cabin
    await query(
      `INSERT INTO cabins (
        local_id, name, country, region, municipality, latitude, longitude,
        altitude, capacity, amenities, is_free, requires_booking, type, email,
        phone, website, facebook, instagram, description, last_updated
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )
      ON DUPLICATE KEY UPDATE
        name = VALUES(name),
        country = VALUES(country),
        region = VALUES(region),
        municipality = VALUES(municipality),
        latitude = VALUES(latitude),
        longitude = VALUES(longitude),
        altitude = VALUES(altitude),
        capacity = VALUES(capacity),
        amenities = VALUES(amenities),
        is_free = VALUES(is_free),
        requires_booking = VALUES(requires_booking),
        type = VALUES(type),
        email = VALUES(email),
        phone = VALUES(phone),
        website = VALUES(website),
        facebook = VALUES(facebook),
        instagram = VALUES(instagram),
        description = VALUES(description),
        last_updated = VALUES(last_updated)`,
      [
        cabin.local_id,
        cabin.name,
        cabin.country,
        cabin.region,
        cabin.municipality,
        cabin.latitude,
        cabin.longitude,
        cabin.altitude,
        cabin.capacity,
        JSON.stringify(cabin.amenities),
        cabin.isFree,
        cabin.requiresBooking,
        cabin.mappedType,
        cabin.email,
        cabin.phone,
        cabin.website,
        cabin.facebook,
        cabin.instagram,
        cabin.description,
        cabin.lastUpdated,
      ]
    );

    // Insert related images
    if (shelter.media?.length) {
      for (const image of shelter.media) {
        await query(
          `INSERT IGNORE INTO cabin_images (
            cabin_local_id, name, file_name, original_url, preview_url
          ) VALUES (?, ?, ?, ?, ?)`,
          [
            localId,
            image.name,
            image.file_name,
            image.original_url,
            image.preview_url,
          ]
        );
      }
    }

    count++;
  }

  return count;
}
