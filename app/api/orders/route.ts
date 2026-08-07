import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_ORDERS, mockCreateOrder } from "@/lib/mockData";

export const dynamic = "force-dynamic";

async function getUserId() {
  const session = await auth();
  return session?.user?.id || "cust_1";
}

export async function GET() {
  try {
    const userId = await getUserId();

    const orders = await runDb(
      async () => {
        return await prisma.order.findMany({
          where: { userId },
          include: { items: { include: { menuItem: true } } },
          orderBy: { createdAt: "desc" },
        });
      },
      () => {
        return MOCK_ORDERS.filter((o) => o.userId === userId);
      }
    );

    return NextResponse.json(orders);
  } catch (error) {
    console.error("GET orders error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getUserId();
    const body = await req.json();
    const {
      items, // array of { menuItemId, quantity, price, customization }
      subtotal,
      tax,
      delivery,
      discount,
      total,
      paymentMethod,
      address,
      couponCode,
    } = body;

    if (!items || items.length === 0 || !address) {
      return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
    }

    const newOrder = await runDb(
      async () => {
        // Create order in transaction
        const result = await prisma.$transaction(async (tx) => {
          const order = await tx.order.create({
            data: {
              userId,
              subtotal,
              tax,
              delivery,
              discount,
              total,
              paymentMethod,
              address,
              couponCode,
              paymentStatus: paymentMethod === "COD" ? "PENDING" : "PENDING",
              status: "PENDING",
            },
          });

          // Create order items
          for (const item of items) {
            await tx.orderItem.create({
              data: {
                orderId: order.id,
                menuItemId: item.menuItemId,
                quantity: item.quantity,
                price: item.price,
                customization: item.customization ? JSON.stringify(item.customization) : null,
              },
            });
          }

          // Clear user's cart
          await tx.cartItem.deleteMany({ where: { userId } });

          // Fetch full created order details to return
          return await tx.order.findUnique({
            where: { id: order.id },
            include: { items: { include: { menuItem: true } } },
          });
        });
        return result;
      },
      () => {
        // Fallback mock create
        return mockCreateOrder({
          userId,
          subtotal,
          tax,
          delivery,
          discount,
          total,
          paymentMethod,
          address,
          couponCode,
          paymentStatus: "PENDING",
          items: items.map((i: any) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            price: i.price,
            customization: i.customization ? JSON.stringify(i.customization) : null,
          })),
        });
      }
    );

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error("POST create order error:", error);
    return NextResponse.json({ error: "Failed to place order" }, { status: 500 });
  }
}
