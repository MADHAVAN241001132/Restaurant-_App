import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { runDb } from "@/lib/dbHelper";
import { MOCK_ORDERS, MOCK_MENU } from "@/lib/mockData";

export async function GET() {
  try {
    const data = await runDb(
      async () => {
        // Query analytics from database
        const orders = await prisma.order.findMany({
          include: { items: { include: { menuItem: true } } },
        });

        const completedOrders = orders.filter((o: any) => o.paymentStatus === "COMPLETED");
        const totalRevenue = completedOrders.reduce((sum, o: any) => sum + o.total, 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Group status counts
        const statusCounts = orders.reduce((acc: Record<string, number>, o: any) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        }, {});

        // Compute top menu items
        const itemSales: Record<string, { name: string, count: number, revenue: number }> = {};
        for (const order of orders) {
          for (const item of order.items) {
            const mId = item.menuItemId;
            if (!itemSales[mId]) {
              itemSales[mId] = { name: item.menuItem.name, count: 0, revenue: 0 };
            }
            itemSales[mId].count += item.quantity;
            itemSales[mId].revenue += item.price * item.quantity;
          }
        }

        const bestSellers = Object.values(itemSales)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Simple monthly data trend (using dates)
        const salesByMonth = orders.reduce((acc: Record<string, number>, o: any) => {
          const date = new Date(o.createdAt);
          const month = date.toLocaleString("default", { month: "short" });
          acc[month] = (acc[month] || 0) + o.total;
          return acc;
        }, {});

        const salesTrend = Object.entries(salesByMonth).map(([name, sales]) => ({
          name,
          sales: Math.round(sales * 100) / 100,
        }));

        // Recent orders
        const recentOrders = await prisma.order.findMany({
          take: 5,
          include: { user: true },
          orderBy: { createdAt: "desc" },
        });

        return {
          metrics: {
            revenue: Math.round(totalRevenue * 100) / 100,
            ordersCount: totalOrders,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
            pendingOrders: statusCounts["PENDING"] || 0,
            completedOrders: statusCounts["DELIVERED"] || 0,
            preparingOrders: statusCounts["PREPARING"] || 0,
          },
          bestSellers,
          salesTrend: salesTrend.length > 0 ? salesTrend : [{ name: "Jul", sales: totalRevenue }],
          recentOrders: recentOrders.map((o: any) => ({
            id: o.id,
            customerName: o.user.name || "Customer",
            total: o.total,
            status: o.status,
            paymentStatus: o.paymentStatus,
            createdAt: o.createdAt,
          })),
        };
      },
      () => {
        // Fallback mock dashboard calculations
        const orders = MOCK_ORDERS;
        const totalRevenue = orders
          .filter((o) => o.paymentStatus === "COMPLETED")
          .reduce((sum, o) => sum + o.total, 0);

        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const statusCounts = orders.reduce((acc: Record<string, number>, o) => {
          acc[o.status] = (acc[o.status] || 0) + 1;
          return acc;
        }, {});

        // Mock sales trend
        const salesTrend = [
          { name: "Jan", sales: 1200 },
          { name: "Feb", sales: 1900 },
          { name: "Mar", sales: 1500 },
          { name: "Apr", sales: 2400 },
          { name: "May", sales: 3200 },
          { name: "Jun", sales: 2800 },
          { name: "Jul", sales: totalRevenue > 0 ? Math.round(totalRevenue * 100) / 100 : 4100 },
        ];

        const bestSellers = [
          { name: "Paneer Butter Masala", count: 42, revenue: 587.58 },
          { name: "Margherita Pizza", count: 35, revenue: 454.65 },
          { name: "Classic Cheeseburger", count: 28, revenue: 279.72 },
          { name: "Chocolate Lava Cake", count: 25, revenue: 174.75 },
          { name: "Mango Lassi", count: 20, revenue: 79.80 },
        ];

        const recentOrders = orders.slice(0, 5).map((o) => ({
          id: o.id,
          customerName: o.userId === "cust_1" ? "John Doe" : "Jane Smith",
          total: o.total,
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: new Date(o.createdAt),
        }));

        return {
          metrics: {
            revenue: Math.round(totalRevenue * 100) / 100,
            ordersCount: totalOrders,
            avgOrderValue: Math.round(avgOrderValue * 100) / 100,
            pendingOrders: statusCounts["PENDING"] || 0,
            completedOrders: statusCounts["DELIVERED"] || 0,
            preparingOrders: statusCounts["PREPARING"] || 0,
          },
          bestSellers,
          salesTrend,
          recentOrders,
        };
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("GET admin dashboard analytics error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
export const dynamic = 'force-dynamic';
