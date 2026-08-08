import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_MENU } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await runDb(
      async () => {
        return await prisma.menuItem.findUnique({
          where: { id },
          include: { category: true, cuisine: true, reviews: { include: { user: true } } },
        });
      },
      () => {
        const found = MOCK_MENU.find((item) => item.id === id);
        if (!found) {
          return null;
        }
        return {
          ...found,
          category: { id: found.categoryId, name: "Category", status: "ACTIVE", image: null },
          cuisine: { id: found.cuisineId, name: "Cuisine", status: "ACTIVE", image: null },
          reviews: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    );

    if (!item) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET menu item by id error:", error);
    return NextResponse.json({ error: "Failed to fetch menu item" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const { id: _id, category, cuisine, reviews, createdAt, updatedAt, ...cleanBody } = body;

    if (cleanBody.price !== undefined) cleanBody.price = Number(cleanBody.price);
    if (cleanBody.offerPrice !== undefined) {
      cleanBody.offerPrice = (cleanBody.offerPrice === null || cleanBody.offerPrice === "") ? null : Number(cleanBody.offerPrice);
    }
    if (cleanBody.preparationTime !== undefined) cleanBody.preparationTime = Number(cleanBody.preparationTime);
    if (cleanBody.available !== undefined) cleanBody.available = Boolean(cleanBody.available);
    if (cleanBody.veg !== undefined) cleanBody.veg = Boolean(cleanBody.veg);
    if (cleanBody.featured !== undefined) cleanBody.featured = Boolean(cleanBody.featured);

    // 1. Synchronize in-memory mock state first so fallback reads updated state
    const mockIdx = MOCK_MENU.findIndex(
      (item) => item.id === id || item.name.toLowerCase() === (cleanBody.name || "").toLowerCase()
    );
    if (mockIdx !== -1) {
      MOCK_MENU[mockIdx] = {
        ...MOCK_MENU[mockIdx],
        ...cleanBody,
        updatedAt: new Date(),
      };
    }

    // 2. Synchronize database state
    const updatedItem = await runDb(
      async () => {
        try {
          return await prisma.menuItem.update({
            where: { id },
            data: cleanBody,
            include: { category: true, cuisine: true },
          });
        } catch (err) {
          // If ID format differs between mock & DB seed, match by dish name
          if (cleanBody.name) {
            const dbItem = await prisma.menuItem.findFirst({ where: { name: cleanBody.name } });
            if (dbItem) {
              return await prisma.menuItem.update({
                where: { id: dbItem.id },
                data: cleanBody,
                include: { category: true, cuisine: true },
              });
            }
          }
          throw err;
        }
      },
      () => {
        const item = mockIdx !== -1 ? MOCK_MENU[mockIdx] : null;
        if (!item) return null;
        return {
          ...item,
          category: { id: item.categoryId, name: "Category", status: "ACTIVE", image: null },
          cuisine: { id: item.cuisineId, name: "Cuisine", status: "ACTIVE", image: null },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    );

    if (!updatedItem && mockIdx === -1) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem || MOCK_MENU[mockIdx]);
  } catch (error) {
    console.error("PUT menu item error:", error);
    return NextResponse.json({ error: "Failed to update menu item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1. Remove from in-memory mock state
    const mockIdx = MOCK_MENU.findIndex((item) => item.id === id);
    let deletedMock = null;
    if (mockIdx !== -1) {
      deletedMock = MOCK_MENU[mockIdx];
      MOCK_MENU.splice(mockIdx, 1);
    }

    // 2. Remove from database
    const deletedItem = await runDb(
      async () => {
        try {
          return await prisma.menuItem.delete({
            where: { id },
          });
        } catch (err) {
          if (deletedMock?.name) {
            const dbItem = await prisma.menuItem.findFirst({ where: { name: deletedMock.name } });
            if (dbItem) {
              return await prisma.menuItem.delete({ where: { id: dbItem.id } });
            }
          }
          throw err;
        }
      },
      () => deletedMock
    );

    if (!deletedItem && !deletedMock) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("DELETE menu item error:", error);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
