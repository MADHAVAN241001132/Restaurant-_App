"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { useCartStore } from "@/store/useCartStore";
import { MapPin, CreditCard, ShoppingBag, ArrowRight, ShieldCheck, Ticket } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotals, clearCart, coupon } = useCartStore();

  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Simulated Payment Modal State
  const [showSimulatedPayment, setShowSimulatedPayment] = useState(false);
  const [paymentOrderDetails, setPaymentOrderDetails] = useState<any | null>(null);

  const totals = getTotals();

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
    }
  }, [cart, router]);

  // Load user data if logged in
  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/cart");
        // Simple helper check, not strictly required for autofill
      } catch (err) {}
    }
    loadUser();
  }, []);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim() || !phone.trim()) {
      setError("Please fill out your delivery address and phone number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const orderPayload = {
        items: cart.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          price: item.menuItem.offerPrice ?? item.menuItem.price,
          customization: item.customization ? JSON.parse(item.customization) : null,
        })),
        subtotal: totals.subtotal,
        tax: totals.tax,
        delivery: totals.delivery,
        discount: totals.discount,
        total: totals.total,
        paymentMethod,
        address,
        couponCode: coupon?.code || null,
      };

      if (paymentMethod === "COD") {
        // Cash on Delivery flow
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });

        const data = await res.json();
        if (res.ok) {
          await clearCart();
          router.push(`/orders/${data.id}`);
        } else {
          setError(data.error || "Failed to place order.");
        }
      } else {
        // Razorpay flow
        // 1. Create order in our system first, but mark payment status as PENDING
        const orderRes = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...orderPayload, paymentStatus: "PENDING" }),
        });

        const ourOrder = await orderRes.json();
        if (!orderRes.ok) {
          setError(ourOrder.error || "Failed to initialize order.");
          setLoading(false);
          return;
        }

        // 2. Call our payment gateway api to create Razorpay Order
        const payRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: totals.total }),
        });

        const payOrder = await payRes.json();

        if (payOrder.mock) {
          // Open simulated gateway popup for mock credentials
          setPaymentOrderDetails({ ...payOrder, dbOrderId: ourOrder.id });
          setShowSimulatedPayment(true);
        } else {
          // Open real Razorpay Checkout Popup
          const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_mockkey12345",
            amount: payOrder.amount,
            currency: payOrder.currency,
            name: "GustoBites Restaurant",
            description: "Online Food Purchase",
            order_id: payOrder.id,
            handler: async function (response: any) {
              // Verify payment signature
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: ourOrder.id,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.success) {
                await clearCart();
                router.push(`/orders/${ourOrder.id}`);
              } else {
                setError("Payment verification failed. Please contact support.");
              }
            },
            prefill: {
              contact: phone,
            },
            theme: {
              color: "#f97316",
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      console.error("Order error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateSuccess = async () => {
    if (!paymentOrderDetails) return;
    setLoading(true);
    setShowSimulatedPayment(false);

    try {
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: paymentOrderDetails.dbOrderId,
          razorpayOrderId: paymentOrderDetails.id,
          razorpayPaymentId: "pay_mock_" + Math.random().toString(36).substr(2, 9),
          razorpaySignature: "mock_signature_verified",
        }),
      });

      const verifyData = await verifyRes.json();
      if (verifyRes.ok && verifyData.success) {
        await clearCart();
        router.push(`/orders/${paymentOrderDetails.dbOrderId}`);
      } else {
        setError("Simulated payment verification failed.");
      }
    } catch (err) {
      setError("Simulated verification error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-8">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
        <p className="text-sm text-muted-foreground">Complete your shipping & payment details below.</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Columns: Delivery & Payment Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Delivery Address Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Delivery Details
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Delivery Address
                </label>
                <textarea
                  required
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street name, apartment, building, flat number, city, and zip code..."
                  className="w-full border border-border rounded-xl bg-background p-3 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1 block">
                  Phone Number
                </label>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="10-digit mobile number..."
                  className="w-full border border-border rounded-xl bg-background px-3 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentMethod("COD")}
                className={`flex gap-3 items-center rounded-xl border p-4 text-left transition-all ${
                  paymentMethod === "COD"
                    ? "border-primary bg-primary/5 text-foreground font-bold"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                  💵
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pay in cash or UPI at delivery.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("RAZORPAY")}
                className={`flex gap-3 items-center rounded-xl border p-4 text-left transition-all ${
                  paymentMethod === "RAZORPAY"
                    ? "border-primary bg-primary/5 text-foreground font-bold"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-foreground">
                  💳
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Pay with Razorpay</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Secure card/UPI netbanking payment.</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary Panel */}
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
            <h3 className="font-bold text-lg flex items-center gap-2 border-b border-border/50 pb-3">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Basket Items
            </h3>

            {/* Cart Items List */}
            <div className="flex flex-col gap-3.5 max-h-[220px] overflow-y-auto pr-1">
              {cart.map((item) => {
                const price = item.menuItem.offerPrice ?? item.menuItem.price;
                return (
                  <div key={item.id} className="flex justify-between items-center gap-4 text-xs font-semibold">
                    <span className="text-muted-foreground truncate">
                      {item.menuItem.name} <span className="text-primary font-bold">x {item.quantity}</span>
                    </span>
                    <span className="text-foreground shrink-0">₹{(price * item.quantity).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground font-medium border-t border-border/50 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-foreground font-bold">₹{totals.subtotal.toFixed(2)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-500">
                  <span>Discount</span>
                  <span>-₹{totals.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Tax (5% GST)</span>
                <span className="text-foreground font-bold">₹{totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charges</span>
                <span className="text-foreground font-bold">
                  {totals.delivery === 0 ? <span className="text-green-500 font-bold">FREE</span> : `₹${totals.delivery}`}
                </span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-baseline border-t border-border pt-4 mt-1">
              <span className="font-bold text-sm">Grand Total</span>
              <span className="text-xl font-extrabold text-primary">₹{totals.total.toFixed(2)}</span>
            </div>

            {error && <p className="text-xs font-semibold text-red-500 text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-between justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground py-3 px-4 font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-75"
            >
              {loading ? (
                <span className="mx-auto flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                  Processing...
                </span>
              ) : (
                <>
                  Place Order (₹{totals.total.toFixed(2)})
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </div>

          <div className="rounded-xl border border-border p-4 bg-muted/40 flex items-center gap-3 text-xs text-muted-foreground leading-normal">
            <ShieldCheck className="h-8 w-8 text-green-500 shrink-0" />
            <p>Your connection is securely encrypted. Secure payment handles and validation protect all orders.</p>
          </div>
        </div>
      </form>

      {/* 5. Simulated Payment Gateway Dialog Modal */}
      {showSimulatedPayment && paymentOrderDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-3xl border border-border bg-card shadow-2xl p-6 flex flex-col gap-6 animate-in zoom-in-95 duration-200 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto text-2xl">
              💳
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Razorpay Sandbox Gateway</h3>
              <p className="text-xs text-muted-foreground mt-1.5 leading-normal">
                You are paying <span className="font-extrabold text-primary">₹{totals.total.toFixed(2)}</span>.
                Since you are in local sandbox mode, select below to verify integration signature.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleSimulateSuccess}
                className="w-full rounded-xl bg-green-500 hover:bg-green-600 text-white py-2.5 text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Simulate Successful Payment
              </button>
              <button
                onClick={() => {
                  setShowSimulatedPayment(false);
                  setError("Payment was cancelled by the user.");
                }}
                className="w-full rounded-xl border border-border hover:bg-muted py-2.5 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel / Simulate Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
