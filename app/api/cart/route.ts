import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_CART, mockAddToCart, mockUpdateCart, mockRemoveFromCart } from "@/lib/mockData";

export const dynamic = "force-dynamic";

// Get user session or fallback to mock user for local testing
async function getUserId() {
  const session = await auth();
  return session?.user?.id || "cust_1";
}

export async function GET() {
  try {
    const userId = await getUserId();

    const items = await runDb(
      async () => {
        return await prisma.cartItem.findMany({
          where: { userId },
          include: { menuItem: true },
        });
      },
      () => {
        return MOCK_CART.filter((c) => c.userId === userId);
      }
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error("GET cart error:", error);
    return NextResponse.json({ error: "Failed to fetch cart" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const body = await req.json();
    const { menuItemId, quantity, customization } = body;

    if (!menuItemId) {
      return NextResponse.json({ error: "Menu item ID is required" }, { status: 400 });
    }

    const items = await runDb(
      async () => {
        const customStr = customization ? JSON.stringify(customization) : null;
        // Check if item already exists in database cart
        const existing = await prisma.cartItem.findFirst({
          where: { userId, menuItemId, customization: customStr },
        });

        if (existing) {
          await prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity: existing.quantity + (quantity || 1) },
          });
        } else {
          await prisma.cartItem.create({
            data: {
              userId,
              menuItemId,
              quantity: quantity || 1,
              customization: customStr,
            },
          });
        }

        return await prisma.cartItem.findMany({
          where: { userId },
          include: { menuItem: true },
        });
      },
      () => {
        return mockAddToCart({
          userId,
          menuItemId,
          quantity: quantity || 1,
          customization: customization ? JSON.stringify(customization) : null,
        });
      }
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error("POST cart error:", error);
    return NextResponse.json({ error: "Failed to add to cart" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const userId = await getUserId();
    const body = await req.json();
    const { id, quantity } = body; // id here is the cartItem's ID

    if (!id || quantity === undefined) {
      return NextResponse.json({ error: "Cart item ID and quantity are required" }, { status: 400 });
    }

    const items = await runDb(
      async () => {
        if (quantity <= 0) {
          await prisma.cartItem.delete({ where: { id } });
        } else {
          await prisma.cartItem.update({
            where: { id },
            data: { quantity },
          });
        }

        return await prisma.cartItem.findMany({
          where: { userId },
          include: { menuItem: true },
        });
      },
      () => {
        if (quantity <= 0) {
          mockRemoveFromCart(id);
        } else {
          mockUpdateCart(id, quantity);
        }
        return MOCK_CART.filter((c) => c.userId === userId);
      }
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error("PUT cart error:", error);
    return NextResponse.json({ error: "Failed to update cart" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getUserId();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id"); // cartItem's ID

    const items = await runDb(
      async () => {
        if (id) {
          await prisma.cartItem.delete({ where: { id } });
        } else {
          // Clear entire cart for user
          await prisma.cartItem.deleteMany({ where: { userId } });
        }

        return await prisma.cartItem.findMany({
          where: { userId },
          include: { menuItem: true },
        });
      },
      () => {
        if (id) {
          mockRemoveFromCart(id);
        } else {
          // Clear cart
          MOCK_CART.length = 0;
        }
        return MOCK_CART.filter((c) => c.userId === userId);
      }
    );

    return NextResponse.json(items);
  } catch (error) {
    console.error("DELETE cart error:", error);
    return NextResponse.json({ error: "Failed to delete cart item" }, { status: 500 });
  }
}
