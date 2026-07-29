"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";
import { ShoppingBag, Trash2, Plus, Minus, Ticket, X, ArrowRight, Clock } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    loading,
    coupon,
    fetchCart,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    getTotals,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState("");
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; text?: string }>({});
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponFeedback({});
    const res = await applyCoupon(couponCode);
    setCouponLoading(false);

    if (res.success) {
      setCouponFeedback({ success: true, text: res.message });
      setCouponCode("");
    } else {
      setCouponFeedback({ success: false, text: res.error });
    }
  };

  const totals = getTotals();

  if (loading && cart.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-semibold">Loading your delicious selections...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Your Food Basket</h1>
        <p className="text-sm text-muted-foreground">Review your gourmet items before checkout.</p>
      </div>

      {cart.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-3xl bg-card gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-8 w-8" />
          </div>
          <h3 className="font-extrabold text-xl">Basket is Empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Looks like you haven't added any dishes yet. Explore our delicious multi-cuisine menu!
          </p>
          <Link
            href="/menu"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors shadow-md shadow-primary/15"
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Items List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {cart.map((item) => {
              const price = item.menuItem.offerPrice ?? item.menuItem.price;
              const customization = item.customization ? JSON.parse(item.customization) : null;

              return (
                <div
                  key={item.id}
                  className="flex gap-4 p-4 rounded-2xl border border-border bg-card shadow-sm hover:border-primary/20 transition-all"
                >
                  {/* Item Image */}
                  <img
                    src={item.menuItem.image || "/images/menu/default.svg"}
                    alt={item.menuItem.name}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover bg-muted shrink-0 border border-border/50"
                  />

                  {/* Item Content */}
                  <div className="flex flex-col flex-grow gap-1 sm:gap-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-sm sm:text-base leading-tight">
                          {item.menuItem.name}
                        </h3>
                        {/* Customization Details */}
                        {customization && (
                          <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] sm:text-xs text-muted-foreground bg-muted/50 rounded-md px-1.5 py-0.5 w-fit">
                            {customization.portionSize && <span>Size: {customization.portionSize}</span>}
                            {customization.spiceLevel && <span>Spice: {customization.spiceLevel}</span>}
                            {customization.extraCheese && <span>+ Extra Cheese</span>}
                          </div>
                        )}
                      </div>
                      <span className="font-extrabold text-sm sm:text-base text-foreground shrink-0">
                        ₹{(price * item.quantity).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-border rounded-lg bg-background p-1 gap-2.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 hover:text-primary hover:bg-muted rounded transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 hover:text-primary hover:bg-muted rounded transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-muted-foreground hover:text-destructive p-1.5 transition-colors"
                        title="Remove item"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Order Summary Panel */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5 sticky top-20">
              <h3 className="font-extrabold text-lg border-b border-border/50 pb-3">Order Summary</h3>

              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <Ticket className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={couponLoading}
                      className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={couponLoading || !couponCode}
                    className="rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 text-xs font-bold shadow-sm shadow-primary/10 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>

                {/* Coupon Feedback Message */}
                {couponFeedback.text && (
                  <p className={`text-xs font-semibold ${couponFeedback.success ? "text-green-500" : "text-red-500"}`}>
                    {couponFeedback.text}
                  </p>
                )}

                {/* Applied Coupon Tag */}
                {coupon && (
                  <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1.5 text-xs text-green-500 mt-1">
                    <span className="font-bold">Active: {coupon.code} (-₹{totals.discount})</span>
                    <button
                      type="button"
                      onClick={() => removeCoupon()}
                      className="p-0.5 hover:bg-green-500/20 rounded transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </form>

              {/* Breakdown List */}
              <div className="flex flex-col gap-3 text-sm text-muted-foreground font-medium border-t border-border/50 pt-4">
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
                    {totals.delivery === 0 ? <span className="text-green-500">FREE</span> : `₹${totals.delivery}`}
                  </span>
                </div>
                {totals.delivery > 0 && (
                  <p className="text-[10px] text-primary bg-primary/5 p-2 rounded-lg leading-snug">
                    💡 Tip: Add ₹{(500 - totals.subtotal).toFixed(2)} more for <b>Free Delivery</b>!
                  </p>
                )}
              </div>

              {/* Total Row */}
              <div className="flex justify-between items-baseline border-t border-border pt-4 mt-2">
                <span className="font-extrabold text-base">Grand Total</span>
                <span className="text-2xl font-black text-primary">₹{totals.total.toFixed(2)}</span>
              </div>

              {/* Checkout CTA */}
              <Link
                href="/checkout"
                className="w-full flex items-center justify-between justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground py-3 px-4 font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] mt-2 text-center"
              >
                Proceed to Checkout
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
