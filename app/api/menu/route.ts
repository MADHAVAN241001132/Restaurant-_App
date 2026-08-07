import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_MENU } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const cuisineId = searchParams.get("cuisineId");
    const search = searchParams.get("search");
    const veg = searchParams.get("veg"); // "true" or "false"
    const featured = searchParams.get("featured"); // "true"
    const sort = searchParams.get("sort"); // "price-asc", "price-desc", "rating", "newest"

    const items = await runDb(
      async () => {
        const where: any = {};
        if (categoryId) {
          where.categoryId = categoryId;
        }
        if (cuisineId) {
          where.cuisineId = cuisineId;
        }
        if (veg !== null && veg !== "") {
          where.veg = veg === "true";
        }
        if (featured !== null && featured !== "") {
          where.featured = featured === "true";
        }
        if (search) {
          where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ];
        }

        let orderBy: any = {};
        if (sort === "price-asc") {
          orderBy = { price: "asc" };
        } else if (sort === "price-desc") {
          orderBy = { price: "desc" };
        } else if (sort === "rating") {
          orderBy = { rating: "desc" };
        } else {
          orderBy = { createdAt: "desc" };
        }

        return await prisma.menuItem.findMany({
          where,
          orderBy,
          include: { category: true, cuisine: true },
        });
      },
      () => {
        let filtered = [...MOCK_MENU];
        if (categoryId) {
          filtered = filtered.filter((item) => item.categoryId === categoryId);
        }
        if (cuisineId) {
          filtered = filtered.filter((item) => item.cuisineId === cuisineId);
        }
        if (veg !== null && veg !== "") {
          filtered = filtered.filter((item) => item.veg === (veg === "true"));
        }
        if (featured !== null && featured !== "") {
          filtered = filtered.filter((item) => item.featured === (featured === "true"));
        }
        if (search) {
          const s = search.toLowerCase();
          filtered = filtered.filter(
            (item) =>
              item.name.toLowerCase().includes(s) ||
              item.description.toLowerCase().includes(s)
          );
        }

        if (sort === "price-asc") {
          filtered.sort((a, b) => (a.offerPrice ?? a.price) - (b.offerPrice ?? b.price));
        } else if (sort === "price-desc") {
          filtered.sort((a, b) => (b.offerPrice ?? b.price) - (a.offerPrice ?? a.price));
        } else if (sort === "rating") {
          filtered.sort((a, b) => b.rating - a.rating);
        }

        return filtered.map((item) => ({
          ...item,
          category: {
            id: item.categoryId,
            name:
              item.categoryId === "cat_1"
                ? "Pizza"
                : item.categoryId === "cat_2"
                ? "Burger"
                : item.categoryId === "cat_3"
                ? "Desserts"
                : item.categoryId === "cat_4"
                ? "Beverages"
                : item.categoryId === "cat_5"
                ? "Main Course"
                : "Starter",
          },
          cuisine: {
            id: item.cuisineId,
            name:
              item.cuisineId === "cui_1"
                ? "Italian"
                : item.cuisineId === "cui_2"
                ? "American"
                : item.cuisineId === "cui_3"
                ? "Indian"
                : item.cuisineId === "cui_4"
                ? "Chinese"
                : "Mexican",
          },
        }));
      }
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET menu error:", error);
    return NextResponse.json({ error: "Failed to fetch menu items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newItem = await runDb(
      async () => {
        return await prisma.menuItem.create({
          data: body,
          include: { category: true, cuisine: true },
        });
      },
      () => {
        const item = {
          id: "menu_" + Math.random().toString(36).substr(2, 9),
          name: body.name || "",
          description: body.description || "",
          price: Number(body.price) || 0,
          offerPrice: body.offerPrice ? Number(body.offerPrice) : null,
          categoryId: body.categoryId || "cat_1",
          cuisineId: body.cuisineId || "cui_1",
          image: body.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
          veg: body.veg ?? true,
          featured: body.featured ?? false,
          available: body.available ?? true,
          preparationTime: Number(body.preparationTime) || 20,
          rating: 4.5,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        MOCK_MENU.push(item);
        return {
          ...item,
          category: { id: item.categoryId, name: "Category" },
          cuisine: { id: item.cuisineId, name: "Cuisine" },
        };
      }
    );
    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("POST menu item error:", error);
    return NextResponse.json({ error: "Failed to create menu item" }, { status: 500 });
  }
}
