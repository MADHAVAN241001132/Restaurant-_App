import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_CATEGORIES } from "@/lib/mockData";

export async function GET() {
  try {
    const categories = await runDb(
      async () => await prisma.category.findMany({ where: { status: "ACTIVE" } }),
      () => MOCK_CATEGORIES
    );
    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}
