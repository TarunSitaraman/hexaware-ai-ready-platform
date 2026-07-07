import { NextResponse } from "next/server";
import { getDLTPipelineStatus } from "@/lib/databricks";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const status = await getDLTPipelineStatus();
    return NextResponse.json(status);
  } catch (error) {
    console.error("Pipeline API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Databricks Pipeline status" },
      { status: 500 }
    );
  }
}
