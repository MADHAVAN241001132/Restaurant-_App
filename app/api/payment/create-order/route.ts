import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount } = body; // Amount in INR, e.g. 15.99

    if (!amount) {
      return NextResponse.json({ error: "Payment amount is required" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if real keys are supplied, otherwise return mock order response
    if (!keyId || keyId.startsWith("rzp_test_mockkey")) {
      console.warn("⚠️ Using mock Razorpay order creation due to mock API credentials.");
      return NextResponse.json({
        id: "order_mock_" + Math.random().toString(36).substr(2, 9),
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: `receipt_mock_${Date.now()}`,
        mock: true,
      });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const response = await razorpay.orders.create({
      amount: Math.round(amount * 100), // in paise (e.g. 1599)
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    // Graceful fallback to mock order in case of API failure
    return NextResponse.json({
      id: "order_mock_fallback_" + Math.random().toString(36).substr(2, 9),
      amount: 1000,
      currency: "INR",
      receipt: `receipt_fallback_${Date.now()}`,
      mock: true,
      error: error instanceof Error ? error.message : "API connection error",
    });
  }
}
