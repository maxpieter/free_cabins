export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { fetchAllCAI, importCAIToDatabase } from "@/lib/cai-api";

export async function POST() {
  try {
    const shelters = await fetchAllCAI();
    console.log("Fetched shelters count:", shelters.length);
    const count = await importCAIToDatabase(shelters);

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${count} CAI shelters.`,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json(
      {
        error: "Failed to import CAI shelters",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
