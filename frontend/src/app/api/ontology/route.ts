import { NextResponse } from "next/server";
import { getOntologyGraph } from "@/lib/databricks";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const graph = await getOntologyGraph();
    return NextResponse.json(graph);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch Ontology" }, { status: 500 });
  }
}
