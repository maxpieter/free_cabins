import { query, initDatabase } from "./db";
import type { Cabin } from "./types";
import { reverseGeocode } from "@/lib/utils/geo";
import { sanitizeForSQL } from "@/lib/utils/sanitizer";

// Initialize the database on first import
initDatabase().catch(console.error);

// Function to get all cabins from MySQL
export async function getCabins(): Promise<Cabin[]> {
  try {
    const results = await query("SELECT * FROM cabins");

    if (!results || (results as any[]).length === 0) {
      const sampleCabins = getSampleCabins();
      for (const cabin of sampleCabins) {
        await addCabin(cabin);
      }
      return sampleCabins;
    }

    const cabins = results as any[];

    for (const cabin of cabins) {
      const images = await query(
        "SELECT name, file_name, original_url, preview_url FROM cabin_images WHERE cabin_local_id = ?",
        [cabin.local_id]
      );

      cabin.images = (images as any[]).map((img) => ({
        name: img.name,
        fileName: img.file_name,
        mimeType: img.mime_type,
        originalUrl: img.original_url,
        previewUrl: img.preview_url,
      }));
    }

    return cabins.map((row) => ({
      id: String(row.id),
      local_id: row.local_id,
      name: row.name,
      country: row.country,
      region: row.region || undefined,
      municipality: row.municipality || undefined,
      latitude: row.latitude,
      longitude: row.longitude,
      altitude: row.altitude,
      capacity: row.capacity,
      amenities:
        typeof row.amenities === "string"
          ? (() => {
              try {
                return JSON.parse(row.amenities);
              } catch {
                return [row.amenities];
              }
            })()
          : Array.isArray(row.amenities)
          ? row.amenities
          : [],
      isFree: !!row.is_free,
      requiresBooking: !!row.requires_booking,
      type: row.type || undefined,
      email: row.email || undefined,
      phone: row.phone || undefined,
      website: row.website || undefined,
      facebook: row.facebook || undefined,
      instagram: row.instagram || undefined,
      description: row.description || undefined,
      lastUpdated: row.last_updated.toISOString(),
      images: row.images || [],
    }));
  } catch (error) {
    console.error("Error fetching cabins:", error);
    return getSampleCabins();
  }
}
export async function addCabin(
  cabin: Omit<Cabin, "id" | "lastUpdated">
): Promise<Cabin> {
  try {
    // Step 1: Check for existing cabin by coordinates or name
    const result = await query(
      `SELECT * FROM cabins WHERE 
       (ABS(latitude - ?) < 0.0001 AND ABS(longitude - ?) < 0.0001)
       OR LOWER(name) = LOWER(?) LIMIT 1`,
      [cabin.latitude, cabin.longitude, cabin.name]
    );

    const rows = result as Cabin[];
    const existing = rows.length > 0 ? rows[0] : undefined;

    // Step 2: Merge with reverse geocoding if needed
    type LocationData = {
      country: string | null;
      region: string | null;
      municipality: string | null;
      altitude: number | null;
    };

    let fetched: LocationData = {
      country: null,
      region: null,
      municipality: null,
      altitude: null,
    };

    if (
      !cabin.country ||
      !cabin.region ||
      !cabin.municipality ||
      cabin.altitude === undefined
    ) {
      fetched = await reverseGeocode(cabin.latitude, cabin.longitude);
    }
    if (!cabin.local_id) {
      cabin.local_id = `manual-${Date.now()}`;
    }

    const newCabin: Cabin = {
      ...existing,
      ...cabin,
      id: existing?.id || "",
      country: cabin.country ?? fetched.country ?? existing?.country ?? null,
      region: cabin.region ?? fetched.region ?? existing?.region ?? null,
      municipality:
        cabin.municipality ??
        fetched.municipality ??
        existing?.municipality ??
        null,
      altitude: cabin.altitude ?? fetched.altitude ?? existing?.altitude ?? 0,
      lastUpdated: new Date().toISOString().slice(0, 19).replace("T", " "),
    };

    if (existing) {
      // Step 4: Update the existing record
      await query(
        `UPDATE cabins SET
          local_id = ?, name = ?, country = ?, region = ?, municipality = ?, latitude = ?, longitude = ?,
          altitude = ?, capacity = ?, amenities = ?, is_free = ?, requires_booking = ?, type = ?, email = ?,
          phone = ?, website = ?, facebook = ?, instagram = ?, description = ?, last_updated = ?
         WHERE id = ?`,
        [
          newCabin.local_id,
          newCabin.name,
          newCabin.country,
          newCabin.region,
          newCabin.municipality,
          newCabin.latitude,
          newCabin.longitude,
          newCabin.altitude,
          newCabin.capacity,
          JSON.stringify(newCabin.amenities || []),
          newCabin.isFree,
          newCabin.requiresBooking,
          newCabin.type,
          newCabin.email,
          newCabin.phone,
          newCabin.website,
          newCabin.facebook,
          newCabin.instagram,
          newCabin.description,
          newCabin.lastUpdated,
          existing.id,
        ]
      );
    } else {
      // Step 5: Insert new record
      sanitizeForSQL(newCabin);

      await query(
        `INSERT INTO cabins (
          local_id, name, country, region, municipality, latitude, longitude,
          altitude, capacity, amenities, is_free, requires_booking, type, email,
          phone, website, facebook, instagram, description, last_updated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newCabin.local_id,
          newCabin.name,
          newCabin.country,
          newCabin.region,
          newCabin.municipality,
          newCabin.latitude,
          newCabin.longitude,
          newCabin.altitude,
          newCabin.capacity,
          JSON.stringify(newCabin.amenities || []),
          newCabin.isFree,
          newCabin.requiresBooking,
          newCabin.type,
          newCabin.email,
          newCabin.phone,
          newCabin.website,
          newCabin.facebook,
          newCabin.instagram,
          newCabin.description,
          newCabin.lastUpdated,
        ]
      );
    }

    // Step 6: Upsert images
    if (Array.isArray(cabin.images)) {
      for (const image of cabin.images) {
        await query(
          `INSERT INTO cabin_images (
            cabin_local_id, name, file_name, mime_type, original_url, preview_url
          ) VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            file_name = VALUES(file_name),
            mime_type = VALUES(mime_type),
            original_url = VALUES(original_url),
            preview_url = VALUES(preview_url)`,
          [
            newCabin.local_id,
            image.name,
            image.fileName,
            image.mimeType,
            image.originalUrl,
            image.previewUrl || null,
          ]
        );
      }
    }

    return newCabin;
  } catch (error) {
    console.error("Error adding cabin:", error);
    throw new Error("Failed to add cabin");
  }
}

export async function updateCabin(
  id: string,
  cabinData: Partial<Cabin>
): Promise<Cabin> {
  try {
    const cabins = await getCabins();
    const existingCabin = cabins.find((c) => c.id === id);
    if (!existingCabin) throw new Error("Cabin not found");

    // Merge updates and set timestamp
    const updatedCabin: Cabin = sanitizeForSQL({
      ...existingCabin,
      ...cabinData,
      lastUpdated: new Date().toISOString().slice(0, 19).replace("T", " "),
    });

    // Build query
    const keysToUpdate = Object.keys(updatedCabin).filter(
      (key) => key !== "id" && key !== "images"
    );

    const setClauses = keysToUpdate.map(
      (key) => `${key === "lastUpdated" ? "last_updated" : key} = ?`
    );
    const values = keysToUpdate.map((key) =>
      key === "amenities"
        ? JSON.stringify((updatedCabin as any)[key] || [])
        : (updatedCabin as any)[key]
    );

    values.push(id); // for WHERE clause

    await query(
      `UPDATE cabins SET ${setClauses.join(", ")} WHERE id = ?`,
      values
    );

    // Replace images if provided
    if (Array.isArray(cabinData.images)) {
      await query("DELETE FROM cabin_images WHERE cabin_local_id = ?", [
        existingCabin.local_id,
      ]);

      for (const image of cabinData.images) {
        await query(
          `INSERT INTO cabin_images (cabin_local_id, name, file_name, original_url, preview_url)
           VALUES (?, ?, ?, ?, ?)`,
          [
            existingCabin.local_id,
            image.name,
            image.fileName,
            image.originalUrl,
            image.previewUrl || null,
          ]
        );
      }
    }

    return updatedCabin;
  } catch (error) {
    console.error("Error updating cabin:", error);
    throw new Error("Failed to update cabin");
  }
}

// Function to delete a cabin
export async function deleteCabin(id: string): Promise<boolean> {
  try {
    const result = await query("SELECT local_id FROM cabins WHERE id = ?", [
      id,
    ]);

    if ((result as any[]).length === 0) {
      throw new Error("Cabin not found");
    }

    const localId = (result as any[])[0].local_id;

    await query("DELETE FROM cabin_images WHERE cabin_local_id = ?", [localId]);
    await query("DELETE FROM cabins WHERE id = ?", [id]);

    return true;
  } catch (error) {
    console.error("Error deleting cabin:", error);
    throw new Error("Failed to delete cabin");
  }
}

// Sample data for initial seeding
function getSampleCabins(): Cabin[] {
  return [
    {
      id: "cabin-001",
      local_id: "cai-001",
      name: "Rifugio Bivacco Città di Clusone",
      country: "Italy",
      region: "Lombardy",
      municipality: "Clusone",
      latitude: 46.1142,
      longitude: 10.0779,
      altitude: 1820,
      capacity: 9,
      amenities: ["water", "fireplace", "toilet"],
      isFree: true,
      requiresBooking: false,
      type: "bivouac",
      email: "info@clusonehut.it",
      phone: "+39 016351530",
      website: "https://www.rifugidelcai.it/rifugio-bivacco-citta-di-clusone/",
      facebook: "https://facebook.com/clusonehut",
      instagram: "https://instagram.com/clusonehut",
      description: "A mountain bivouac in the Italian Alps",
      lastUpdated: "2023-05-15T10:30:00Z",
      images: [
        {
          id: 100000,
          name: "Exterior View",
          fileName: "exterior.jpg",
          mimeType: "image/jpeg",
          originalUrl: "https://example.com/images/exterior.jpg",
          previewUrl: "https://example.com/images/exterior-thumb.jpg",
        },
      ],
    },
  ];
}
