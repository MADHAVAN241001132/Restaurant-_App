"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Check, Compass, Utensils, Bike, Gift, HeartHandshake } from "lucide-react";

// Fetch order details
async function fetchOrderDetails(id: string) {
  const res = await fetch(`/api/orders/${id}`);
  if (!res.ok) throw new Error("Order not found");
  return res.json();
}

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["orderDetails", id],
    queryFn: () => fetchOrderDetails(id),
    refetchInterval: 8000, // Poll every 8s for live updates
  });

  // Simulated status progression for demo
  const [simulationIndex, setSimulationIndex] = useState(0);

  const stages = [
    { label: "Order Received", desc: "Checking and accepting your request", icon: <Compass className="h-5 w-5" /> },
    { label: "Preparing Food", desc: "Our chefs are cooking your gourmet meal", icon: <Utensils className="h-5 w-5" /> },
    { label: "Out for Delivery", desc: "Your delivery hero is on the way", icon: <Bike className="h-5 w-5" /> },
    { label: "Delivered", desc: "Hope you enjoy your warm, fresh meal!", icon: <Gift className="h-5 w-5" /> },
  ];

  // Map order status to stages
  const getStageIndex = (status: string) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "ACCEPTED":
        return 1;
      case "PREPARING":
        return 1;
      case "OUT_FOR_DELIVERY":
        return 2;
      case "DELIVERED":
        return 3;
      case "CANCELLED":
        return -1;
      default:
        return 0;
    }
  };

  const currentStageIndex = order ? getStageIndex(order.status) : 0;

  // Mutation to update order status for simulation
  const simulateStatusMutation = useMutation({
    mutationFn: async (nextStatus: string) => {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orderDetails", id] });
    },
  });

  const triggerNextStage = () => {
    if (!order) return;
    const stageNames = ["ACCEPTED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
    const idx = stageNames.indexOf(order.status === "PENDING" ? "ACCEPTED" : order.status);
    const nextIdx = (idx + 1) % stageNames.length;
    simulateStatusMutation.mutate(stageNames[nextIdx]);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center flex flex-col items-center gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground font-semibold">Loading live tracking details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center flex flex-col gap-3">
        <span className="text-4xl">⚠️</span>
        <h3 className="font-extrabold text-lg">Order Not Found</h3>
        <p className="text-sm text-muted-foreground">The specified order ID does not exist in our system.</p>
        <Link href="/orders" className="text-primary hover:underline text-sm font-semibold">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* Back to Orders */}
      <div>
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors mb-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to My Orders
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Order Tracking</h1>
            <p className="text-xs font-mono text-muted-foreground mt-1">ID: {order.id}</p>
          </div>

          {/* Admin Simulation Tool */}
          <button
            onClick={triggerNextStage}
            disabled={simulateStatusMutation.isPending || order.status === "DELIVERED" || order.status === "CANCELLED"}
            className="rounded-full bg-secondary/15 hover:bg-secondary/25 border border-secondary/30 px-4 py-2 text-xs font-bold text-secondary transition-colors cursor-pointer self-start sm:self-center disabled:opacity-50"
          >
            {simulateStatusMutation.isPending ? "Updating Stage..." : "Simulate Next Stage ⚙️"}
          </button>
        </div>
      </div>

      {order.status === "CANCELLED" ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center flex flex-col gap-2">
          <h3 className="text-lg font-bold text-red-500">🚫 This Order was Cancelled</h3>
          <p className="text-xs text-muted-foreground">Please reach out to our service line at support@gustobites.com for queries.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns: Visual Tracker Progress */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-8">
            <h3 className="font-bold text-lg border-b border-border/50 pb-3">Delivery Status</h3>

            {/* Tracker Step Indicators */}
            <div className="relative flex flex-col gap-8 pl-8 border-l border-border/70 ml-3">
              {stages.map((stage, idx) => {
                const isCompleted = idx < currentStageIndex || order.status === "DELIVERED";
                const isCurrent = idx === currentStageIndex && order.status !== "DELIVERED";

                return (
                  <div key={idx} className="relative flex flex-col gap-1 text-left">
                    {/* Circle Node */}
                    <div
                      className={`absolute -left-11 top-0 flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold transition-all ${
                        isCompleted
                          ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20"
                          : isCurrent
                          ? "bg-card border-primary text-primary ring-4 ring-primary/10 animate-pulse"
                          : "bg-muted/50 border-border text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? <Check className="h-3.5 w-3.5" /> : idx + 1}
                    </div>

                    <h4 className={`text-sm font-bold ${isCurrent ? "text-primary text-base" : "text-foreground"}`}>
                      {stage.label}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-normal">{stage.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Details & Address Summary */}
          <div className="flex flex-col gap-6">
            {/* Address & Payment Info */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-base border-b border-border/50 pb-2">Delivery Summary</h3>
              <div className="flex flex-col gap-3.5 text-xs">
                <div>
                  <p className="text-muted-foreground uppercase font-bold tracking-wider text-[9px]">Deliver Address</p>
                  <p className="font-semibold text-foreground leading-normal mt-0.5">{order.address}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase font-bold tracking-wider text-[9px]">Payment Method</p>
                  <p className="font-semibold text-foreground mt-0.5">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Online Payment (Razorpay)"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground uppercase font-bold tracking-wider text-[9px]">Payment Status</p>
                  <p className={`font-semibold mt-0.5 ${order.paymentStatus === "COMPLETED" ? "text-green-500" : "text-amber-500"}`}>
                    {order.paymentStatus === "COMPLETED" ? "Completed / Paid" : "Pending Payment"}
                  </p>
                </div>
              </div>
            </div>

            {/* Items Receipt */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
              <h3 className="font-bold text-base border-b border-border/50 pb-2">Receipt</h3>
              <div className="flex flex-col gap-3">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-muted-foreground truncate">
                      {item.menuItem?.name || "Dish Item"} <span className="text-primary font-bold">x{item.quantity}</span>
                    </span>
                    <span className="text-foreground shrink-0">₹{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Total Calculation */}
              <div className="flex flex-col gap-2.5 text-xs text-muted-foreground font-medium border-t border-border/50 pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-foreground font-bold">₹{Number(order.subtotal).toFixed(2)}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Discount</span>
                    <span>-₹{Number(order.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax (5% GST)</span>
                  <span className="text-foreground font-bold">₹{Number(order.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges</span>
                  <span className="text-foreground font-bold">₹{Number(order.delivery).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-baseline border-t border-border pt-4 mt-1">
                <span className="font-bold text-sm">Grand Total</span>
                <span className="text-lg font-extrabold text-primary">₹{Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            <div className="rounded-xl border border-border p-4 bg-muted/40 flex items-center gap-3 text-xs text-muted-foreground leading-normal">
              <HeartHandshake className="h-7 w-7 text-primary shrink-0" />
              <p>Thank you for ordering with GustoBites! Please rate us on your delivery completion.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
