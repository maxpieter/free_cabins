export interface Cabin {
  id: string;
  local_id: string;
  name: string;

  country: string | null;
  region: string | null;
  municipality: string | null;

  latitude: number;
  longitude: number;
  altitude: number | null;

  capacity: number | null;

  amenities: string[];
  isFree: boolean;
  requiresBooking: boolean;

  type: "unattended hut" | "shelter" | "manned hut" | string | null;

  email: string | null;
  phone: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;

  description: string | null;
  lastUpdated: string; // ISO timestamp

  images?: CabinImage[];
}

export interface CabinImage {
  id: number;
  name: string;
  fileName: string;
  mimeType: string;
  originalUrl: string;
  previewUrl?: string;
}

// Define cabin types
export const CABIN_TYPES = ["unattended hut", "shelter", "manned hut"] as const;
