import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_MENU } from "@/lib/mockData";

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

    const updatedItem = await runDb(
      async () => {
        return await prisma.menuItem.update({
          where: { id },
          data: body,
          include: { category: true, cuisine: true },
        });
      },
      () => {
        const idx = MOCK_MENU.findIndex((item) => item.id === id);
        if (idx === -1) {
          return null;
        }
        const updated = {
          ...MOCK_MENU[idx],
          ...body,
          price: body.price !== undefined ? Number(body.price) : MOCK_MENU[idx].price,
          offerPrice: body.offerPrice !== undefined ? (body.offerPrice === null ? null : Number(body.offerPrice)) : MOCK_MENU[idx].offerPrice,
          preparationTime: body.preparationTime !== undefined ? Number(body.preparationTime) : MOCK_MENU[idx].preparationTime,
        };
        MOCK_MENU[idx] = updated;
        return {
          ...updated,
          category: { id: updated.categoryId, name: "Category", status: "ACTIVE", image: null },
          cuisine: { id: updated.cuisineId, name: "Cuisine", status: "ACTIVE", image: null },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json(updatedItem);
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

    const deletedItem = await runDb(
      async () => {
        return await prisma.menuItem.delete({
          where: { id },
        });
      },
      () => {
        const idx = MOCK_MENU.findIndex((item) => item.id === id);
        if (idx === -1) {
          return null;
        }
        const deleted = MOCK_MENU[idx];
        MOCK_MENU.splice(idx, 1);
        return deleted;
      }
    );

    if (!deletedItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Menu item deleted successfully" });
  } catch (error) {
    console.error("DELETE menu item error:", error);
    return NextResponse.json({ error: "Failed to delete menu item" }, { status: 500 });
  }
}
