import { type NextRequest, NextResponse } from "next/server";
import { getCabins, updateCabin, deleteCabin } from "@/lib/data";
import { cookies } from "next/headers";
import { isAdmin } from "@/lib/auth";

/**
 * GET handler for fetching a specific cabin by ID
 * @param request The incoming request
 * @param params Object containing the cabin ID
 * @returns JSON response with the cabin data
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = (await cookies()).get("session")?.value;
  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

/**
 * PUT handler for updating a cabin
 * @param request The incoming request with updated cabin data
 * @param params Object containing the cabin ID
 * @returns JSON response with the updated cabin
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = (await cookies()).get("session")?.value;
  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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

/**
 * DELETE handler for removing a cabin
 * @param request The incoming request
 * @param params Object containing the cabin ID
 * @returns JSON response indicating success or failure
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = (await cookies()).get("session")?.value;
  if (!session || !(await isAdmin(session))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
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
