export async function reverseGeocode(lat: number, lon: number) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "free-cabins-europe-app",
    },
  });

  if (!res.ok) {
    throw new Error("Reverse geocoding failed");
  }

  const data = await res.json();
  const address = data.address || {};
  const altitude = await getAltitude(lat, lon);

  return {
    country: address.country ?? null,
    region: address.state ?? address.region ?? null,
    municipality:
      address.city || address.town || address.village || address.county || null,
    altitude: altitude ?? 0,
  };
}

export async function getAltitude(
  lat: number,
  lon: number
): Promise<number | null> {
  try {
    const url = `https://api.open-elevation.com/api/v1/lookup?locations=${lat},${lon}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error("Elevation API request failed");
    }

    const data = await res.json();
    const elevation = data?.results?.[0]?.elevation;

    return typeof elevation === "number" ? elevation : null;
  } catch (error) {
    console.error("Failed to fetch altitude:", error);
    return null;
  }
}
