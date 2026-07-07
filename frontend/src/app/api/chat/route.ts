import { NextResponse } from "next/server";
import { queryDatabricksModelServing } from "@/lib/databricks";

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    const reply = await queryDatabricksModelServing(message);
    
    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to communicate with Databricks Model Serving" },
      { status: 500 }
    );
  }
}
