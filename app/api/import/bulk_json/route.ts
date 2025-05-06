import { NextRequest, NextResponse } from "next/server";
import { addCabin } from "@/lib/data";
import type { Cabin } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const cabins: Omit<Cabin, "id" | "lastUpdated">[] = await req.json();

    for (const cabin of cabins) {
      await addCabin(cabin); // assumes this method handles insertion + validation
    }

    return NextResponse.json({ message: "Cabins uploaded successfully." });
  } catch (error) {
    console.error("Bulk upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload cabins." },
      { status: 500 }
    );
  }
}
