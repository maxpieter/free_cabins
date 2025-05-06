import { cookies } from "next/headers";
import { isAdmin } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";
import { addCabin } from "@/lib/data";
import { sanitizeForSQL } from "@/lib/utils/sanitizer";

export async function POST(request: NextRequest) {
  const session = (await cookies()).get("session")?.value;
  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const cabinData = await request.json();
    const requiredFields = ["name", "latitude", "longitude"]; // "capacity"
    for (const field of requiredFields) {
      if (cabinData[field] === undefined || cabinData[field] === null) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const cabin = sanitizeForSQL({
      ...cabinData,
      amenities: cabinData.amenities || [],
      requiresBooking: cabinData.requiresBooking || false,
    });

    const newCabin = await addCabin(cabin);
    return NextResponse.json(newCabin, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create cabin" },
      { status: 500 }
    );
  }
}
