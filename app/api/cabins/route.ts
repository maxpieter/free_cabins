import { type NextRequest, NextResponse } from "next/server";
import { getCabins, addCabin } from "@/lib/data";

// GET all cabins
export async function GET() {
  try {
    const cabins = await getCabins();
    return NextResponse.json(cabins);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cabins" },
      { status: 500 }
    );
  }
}

// POST a new cabin
export async function POST(request: NextRequest) {
  try {
    const cabinData = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "country",
      "latitude",
      "longitude",
      "capacity",
      "description",
    ];
    for (const field of requiredFields) {
      if (!cabinData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Set default values for optional fields
    const cabin = {
      ...cabinData,
      amenities: cabinData.amenities || [],
      requiresBooking: cabinData.requiresBooking || false,
    };

    const newCabin = await addCabin(cabin);
    return NextResponse.json(newCabin, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create cabin" },
      { status: 500 }
    );
  }
}
