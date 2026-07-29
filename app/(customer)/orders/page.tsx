"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Clock, CheckCircle2, RotateCcw, ArrowRight, ShieldX, MapPin, Calendar } from "lucide-react";

async function fetchOrders() {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  return res.json();
}

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["orders"],
    queryFn: fetchOrders,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-500/10 border-green-500/20 text-green-500";
      case "CANCELLED":
        return "bg-red-500/10 border-red-500/20 text-red-500";
      case "PENDING":
        return "bg-amber-500/10 border-amber-500/20 text-amber-500";
      default: // Preparing, Out for delivery
        return "bg-blue-500/10 border-blue-500/20 text-blue-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "CANCELLED":
        return <ShieldX className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-semibold">Fetching your orders history...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl w-full px-4 py-10 sm:px-6 lg:px-8 flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Your Orders</h1>
        <p className="text-sm text-muted-foreground">Track live orders and view order history details.</p>
      </div>

      {!orders || orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-3xl bg-card gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <RotateCcw className="h-8 w-8" />
          </div>
          <h3 className="font-extrabold text-xl">No Orders Found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            You haven't placed any orders yet. Head over to our catalog page to find delicious dishes!
          </p>
          <Link
            href="/menu"
            className="rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors shadow-md"
          >
            Explore Menu
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:border-primary/20 transition-all flex flex-col"
            >
              {/* Top Banner details */}
              <div className="bg-muted/40 border-b border-border p-4 sm:p-5 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-muted-foreground">
                  <div>
                    <p className="uppercase tracking-wider text-[10px]">Order ID</p>
                    <p className="text-foreground font-bold font-mono text-sm mt-0.5">{order.id}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-[10px]">Date Placed</p>
                    <div className="flex items-center gap-1 text-foreground font-medium mt-0.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                  <div>
                    <p className="uppercase tracking-wider text-[10px]">Total Amount</p>
                    <p className="text-primary font-extrabold text-sm mt-0.5">₹{Number(order.total).toFixed(2)}</p>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-bold ${
                    order.paymentStatus === "COMPLETED"
                      ? "bg-green-500/10 border-green-500/20 text-green-500"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                  }`}>
                    {order.paymentStatus === "COMPLETED" ? "Paid" : "Payment Pending"}
                  </span>
                </div>
              </div>

              {/* Items List inside card */}
              <div className="p-4 sm:p-5 flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center gap-4 text-xs font-semibold">
                      <div className="flex items-baseline gap-1.5 min-w-0">
                        <span className="text-primary font-bold shrink-0">{item.quantity} x</span>
                        <span className="text-foreground truncate font-bold">{item.menuItem?.name || "Dish Item"}</span>
                        {item.customization && (
                          <span className="text-[10px] text-muted-foreground bg-muted rounded px-1 shrink-0 font-medium">Customized</span>
                        )}
                      </div>
                      <span className="text-muted-foreground shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border/50 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground self-start font-medium">
                    <MapPin className="h-4 w-4 text-primary shrink-0" />
                    <span className="truncate max-w-[280px] sm:max-w-md">{order.address}</span>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-between justify-center gap-2 rounded-xl border border-border px-5 py-2.5 text-xs font-bold hover:bg-muted/50 transition-colors shadow-sm"
                  >
                    Track Live Order
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
