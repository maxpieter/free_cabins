import { type NextRequest, NextResponse } from "next/server";
import { getCabins, updateCabin, deleteCabin } from "@/lib/data";

// GET a specific cabin
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cabins = await getCabins();
    const cabin = cabins.find((c) => c.id === params.id);

    if (!cabin) {
      return NextResponse.json({ error: "Cabin not found" }, { status: 404 });
    }

    return NextResponse.json(cabin);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch cabin" },
      { status: 500 }
    );
  }
}

// PUT/PATCH to update a cabin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const cabinData = await request.json();
    const updatedCabin = await updateCabin(params.id, cabinData);

    return NextResponse.json(updatedCabin);
  } catch (error) {
    if ((error as Error).message === "Cabin not found") {
      return NextResponse.json({ error: "Cabin not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to update cabin" },
      { status: 500 }
    );
  }
}

// DELETE a cabin
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const success = await deleteCabin(params.id);

    if (!success) {
      return NextResponse.json({ error: "Cabin not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).message === "Cabin not found") {
      return NextResponse.json({ error: "Cabin not found" }, { status: 404 });
    }

    return NextResponse.json(
      { error: "Failed to delete cabin" },
      { status: 500 }
    );
  }
}
