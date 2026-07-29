"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, User, Calendar, MapPin, ExternalLink, ShieldCheck } from "lucide-react";
import Link from "next/link";

async function fetchAllOrders() {
  const res = await fetch("/api/orders"); // In database client mode, GET returns all orders for Admin, otherwise filtered
  if (!res.ok) throw new Error("Failed to fetch admin orders list");
  return res.json();
}

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["adminOrders"],
    queryFn: fetchAllOrders,
    refetchInterval: 10000, // Poll every 10s
  });

  // Mutation to update order status or payment status
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status, paymentStatus }: { orderId: string; status: string; paymentStatus?: string }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(paymentStatus ? { paymentStatus } : {}) }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminOrders"] });
    },
  });

  const handleStatusChange = (orderId: string, status: string) => {
    updateOrderMutation.mutate({ orderId, status });
  };

  const handlePaymentChange = (orderId: string, paymentStatus: string) => {
    const order = orders?.find((o: any) => o.id === orderId);
    if (order) {
      updateOrderMutation.mutate({ orderId, status: order.status, paymentStatus });
    }
  };

  const orderStages = [
    { value: "PENDING", label: "Pending Acceptance" },
    { value: "ACCEPTED", label: "Accepted" },
    { value: "PREPARING", label: "Preparing Food" },
    { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const paymentStatuses = [
    { value: "PENDING", label: "Pending" },
    { value: "COMPLETED", label: "Paid" },
    { value: "FAILED", label: "Failed" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Active Orders Tracker</h1>
        <p className="text-sm text-muted-foreground">Manage ongoing customer deliveries and update kitchen stages.</p>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
        {isLoading ? (
          <div className="p-8 text-center flex flex-col items-center gap-2 animate-pulse">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-muted-foreground font-semibold">Loading orders board...</p>
          </div>
        ) : !orders || orders.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2 p-6">
            <ClipboardList className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-extrabold text-base">No Customer Orders</h3>
            <p className="text-xs text-muted-foreground max-w-xs">Customer food bookings will show up here in real-time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                <tr>
                  <th className="px-6 py-3.5">Order ID</th>
                  <th className="px-6 py-3.5">Items Placed</th>
                  <th className="px-6 py-3.5">Customer & Delivery</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Kitchen Stage</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                    {/* Order ID */}
                    <td className="px-6 py-4 font-bold font-mono text-primary">
                      {order.id}
                    </td>

                    {/* Items detail list */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5 max-w-[200px]">
                        {order.items?.map((item: any, idx: number) => (
                          <p key={idx} className="truncate text-foreground text-[11px] leading-tight">
                            <span className="text-primary font-bold">{item.quantity}</span> x{" "}
                            {item.menuItem?.name || "Dish Item"}
                          </p>
                        ))}
                      </div>
                    </td>

                    {/* Delivery & details */}
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      <div className="flex flex-col gap-1">
                        <span className="text-foreground font-bold flex items-center gap-1">
                          <User className="h-3 w-3 shrink-0" />
                          {order.userId === "cust_1" ? "John Doe" : "Customer"}
                        </span>
                        <span className="text-[10px] flex items-center gap-1 leading-tight max-w-[180px] truncate">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          {order.address}
                        </span>
                        <span className="text-[10px] flex items-center gap-1 font-mono">
                          <Calendar className="h-3 w-3 text-secondary shrink-0" />
                          {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="px-6 py-4 font-extrabold text-foreground text-sm">
                      ₹{Number(order.total).toFixed(2)}
                    </td>

                    {/* Kitchen stage dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`border rounded-lg p-1.5 text-xs font-bold focus:outline-none focus:border-primary bg-background ${
                          order.status === "DELIVERED"
                            ? "border-green-500 text-green-500 bg-green-500/5"
                            : order.status === "CANCELLED"
                            ? "border-red-500 text-red-500 bg-red-500/5"
                            : "border-border text-foreground"
                        }`}
                      >
                        {orderStages.map((stage) => (
                          <option key={stage.value} value={stage.value}>
                            {stage.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Payment status dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={order.paymentStatus}
                        onChange={(e) => handlePaymentChange(order.id, e.target.value)}
                        className={`border rounded-lg p-1.5 text-xs font-bold focus:outline-none focus:border-primary bg-background ${
                          order.paymentStatus === "COMPLETED"
                            ? "border-green-500 text-green-500 bg-green-500/5"
                            : "border-border text-foreground"
                        }`}
                      >
                        {paymentStatuses.map((p) => (
                          <option key={p.value} value={p.value}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Actions link to tracking */}
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-[10px] font-bold hover:bg-muted/50 transition-colors shadow-sm"
                      >
                        Track View
                        <ExternalLink className="h-3 w-3 text-primary" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
