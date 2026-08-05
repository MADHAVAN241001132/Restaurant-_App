import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_COUPONS } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, cartSubtotal } = body;

    if (!code || cartSubtotal === undefined) {
      return NextResponse.json({ error: "Coupon code and subtotal are required" }, { status: 400 });
    }

    const coupon = await runDb(
      async () => {
        return await prisma.coupon.findUnique({
          where: { code: code.toUpperCase() },
        });
      },
      () => {
        const found = MOCK_COUPONS.find((c) => c.code === code.toUpperCase());
        if (!found) return null;
        return {
          ...found,
          expiry: new Date(found.expiry),
          createdAt: new Date(),
        };
      }
    );

    if (!coupon) {
      return NextResponse.json({ error: "Invalid coupon code" }, { status: 404 });
    }

    const now = new Date();
    const expiryDate = new Date(coupon.expiry);
    if (now > expiryDate) {
      return NextResponse.json({ error: "This coupon code has expired" }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "This coupon has reached its usage limit" }, { status: 400 });
    }

    // Compute discount
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = (cartSubtotal * coupon.discount) / 100;
    } else {
      discountAmount = Math.min(coupon.discount, cartSubtotal);
    }

    // Cap decimals
    discountAmount = Math.round(discountAmount * 100) / 100;

    return NextResponse.json({
      success: true,
      code: coupon.code,
      discount: discountAmount,
      type: coupon.type,
      rate: coupon.discount,
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return NextResponse.json({ error: "Failed to apply coupon" }, { status: 500 });
  }
}
