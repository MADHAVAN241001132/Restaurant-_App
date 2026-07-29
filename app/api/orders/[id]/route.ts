import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_ORDERS, mockUpdateOrderStatus } from "@/lib/mockData";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const order = await runDb(
      async () => {
        return await prisma.order.findUnique({
          where: { id },
          include: { items: { include: { menuItem: true } } },
        });
      },
      () => {
        return MOCK_ORDERS.find((o) => o.id === id) || null;
      }
    );

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("GET order details error:", error);
    return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
  }
}

// PUT endpoint to update order status (used by Admins)
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, paymentStatus } = body;

    if (!status) {
      return NextResponse.json({ error: "Order status is required" }, { status: 400 });
    }

    const updatedOrder = await runDb(
      async () => {
        return await prisma.order.update({
          where: { id },
          data: {
            status,
            ...(paymentStatus ? { paymentStatus } : {}),
          },
          include: { items: { include: { menuItem: true } } },
        });
      },
      () => {
        return mockUpdateOrderStatus(id, status, paymentStatus) || null;
      }
    );

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found or update failed" }, { status: 404 });
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("PUT update order error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}
