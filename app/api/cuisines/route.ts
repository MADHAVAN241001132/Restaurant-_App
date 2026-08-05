import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_CUISINES } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cuisines = await runDb(
      async () => await prisma.cuisine.findMany({ where: { status: "ACTIVE" } }),
      () => MOCK_CUISINES
    );
    return NextResponse.json(cuisines);
  } catch (error) {
    console.error("GET cuisines error:", error);
    return NextResponse.json({ error: "Failed to fetch cuisines" }, { status: 500 });
  }
}
