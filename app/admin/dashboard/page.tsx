"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DollarSign, ShoppingBag, Percent, Clock, Star, ArrowRight, User } from "lucide-react";
import Link from "next/link";

async function fetchAdminDashboard() {
  const res = await fetch("/api/admin/dashboard");
  if (!res.ok) throw new Error("Failed to fetch dashboard statistics");
  return res.json();
}

export default function AdminDashboardPage() {
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: fetchAdminDashboard,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="h-10 w-48 bg-muted rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-card border border-border"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-[320px] rounded-2xl bg-card border border-border"></div>
          <div className="h-[320px] rounded-2xl bg-card border border-border"></div>
        </div>
      </div>
    );
  }

  const metrics = dashboard?.metrics || {
    revenue: 0,
    ordersCount: 0,
    avgOrderValue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    preparingOrders: 0,
  };

  const salesTrend = dashboard?.salesTrend || [];
  const maxSaleVal = salesTrend.length > 0 ? Math.max(...salesTrend.map((s: any) => s.sales)) : 100;

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Monitor real-time sales metrics, analytics, and active orders.</p>
      </div>

      {/* 1. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Revenue */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Revenue</span>
            <span className="text-2xl font-black text-primary">₹{metrics.revenue.toFixed(2)}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <DollarSign className="h-5 w-5" />
          </div>
        </div>

        {/* Orders Count */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Orders</span>
            <span className="text-2xl font-black text-foreground">{metrics.ordersCount}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-5 w-5" />
          </div>
        </div>

        {/* AOV */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Avg Order Value</span>
            <span className="text-2xl font-black text-foreground">₹{metrics.avgOrderValue.toFixed(2)}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        {/* Active Orders */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Prep Orders</span>
            <span className="text-2xl font-black text-secondary">{metrics.preparingOrders + metrics.pendingOrders}</span>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary/10 text-secondary">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 2. Charts & Sales Trend Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend (Beautiful CSS Column graph) */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-6">
          <h3 className="font-bold text-base border-b border-border/50 pb-3">Monthly Sales Analytics</h3>
          <div className="flex h-[220px] items-end justify-between gap-4 px-2 pt-6">
            {salesTrend.map((data: any, idx: number) => {
              const pct = maxSaleVal > 0 ? (data.sales / maxSaleVal) * 100 : 0;
              return (
                <div key={idx} className="flex flex-col items-center gap-2 flex-grow h-full justify-end">
                  <span className="text-[10px] font-bold text-primary">₹{Math.round(data.sales)}</span>
                  <div
                    style={{ height: `${Math.max(12, pct)}%` }}
                    className="w-full rounded-t-lg bg-gradient-to-t from-primary/80 to-primary shadow-lg shadow-primary/10 transition-all duration-500"
                  ></div>
                  <span className="text-[10px] font-bold text-muted-foreground mt-1 uppercase">{data.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Selling Items List */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-base border-b border-border/50 pb-2">Best Sellers</h3>
          <div className="flex flex-col gap-3">
            {dashboard?.bestSellers?.map((dish: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted font-extrabold text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-bold text-foreground truncate">{dish.name}</span>
                </div>
                <span className="font-semibold text-muted-foreground shrink-0">
                  {dish.count} sold
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Recent Orders List */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
          <h3 className="font-bold text-base">Recent Customer Orders</h3>
          <Link
            href="/admin/orders"
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            Manage Orders <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-semibold">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
              <tr>
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Total Amt</th>
                <th className="px-6 py-3.5">Order Status</th>
                <th className="px-6 py-3.5">Payment</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {dashboard?.recentOrders?.map((order: any) => (
                <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4 font-bold font-mono text-primary">{order.id}</td>
                  <td className="px-6 py-4 text-foreground flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span>{order.customerName}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-foreground">₹{Number(order.total).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      order.status === "DELIVERED"
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : order.status === "PENDING"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-500"
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      order.paymentStatus === "COMPLETED"
                        ? "bg-green-500/10 border-green-500/20 text-green-500"
                        : "bg-amber-500/10 border-amber-500/20 text-amber-500"
                    }`}>
                      {order.paymentStatus === "COMPLETED" ? "Paid" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/orders/${order.id}`}
                      className="rounded-lg border border-border px-2.5 py-1 text-[10px] font-bold hover:bg-muted/50 transition-colors inline-block"
                    >
                      Track
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export const dynamic = 'force-dynamic';
