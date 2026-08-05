import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { mockUpdateOrderStatus } from "@/lib/mockData";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      orderId, // our system's orderId (e.g., ord_1)
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: "Invalid payment verification data" }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    let isSignatureValid = false;

    // Check if it's a mock order
    if (razorpayOrderId.startsWith("order_mock") || !keySecret || keySecret === "mocksecret67890") {
      console.warn("⚠️ Bypassing payment signature verification due to mock credentials/orders.");
      isSignatureValid = true;
    } else {
      // Perform cryptographic signature verification
      const text = razorpayOrderId + "|" + razorpayPaymentId;
      const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(text)
        .digest("hex");

      isSignatureValid = generatedSignature === razorpaySignature;
    }

    if (!isSignatureValid) {
      return NextResponse.json({ error: "Payment verification failed: invalid signature" }, { status: 400 });
    }

    // Update order status in DB or mock list
    const updated = await runDb(
      async () => {
        // Create payment entry
        await prisma.payment.create({
          data: {
            orderId,
            razorpayOrderId,
            razorpayPaymentId,
            signature: razorpaySignature || "mock_sig",
            status: "SUCCESS",
            amount: 0, // In production, query Razorpay order or pass amount
          },
        });

        // Update order status to PAID / PREPARING or ACCEPTED
        return await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "COMPLETED",
            status: "ACCEPTED",
          },
        });
      },
      () => {
        // Mock update
        return mockUpdateOrderStatus(orderId, "ACCEPTED", "COMPLETED") || null;
      }
    );

    if (!updated) {
      return NextResponse.json({ error: "Order details not found to update payment" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Payment verified and order updated successfully" });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json({ error: "Internal server error during verification" }, { status: 500 });
  }
}
