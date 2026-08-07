"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { LayoutDashboard, UtensilsCrossed, ClipboardList, Home, ShieldAlert, LogOut, Menu, X, PanelLeftOpen } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile sidebar automatically on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (status === "loading") {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-muted-foreground text-sm font-semibold">Authorizing admin console...</p>
      </div>
    );
  }

  const role = (session?.user as any)?.role || "CUSTOMER";
  const isAdmin = role === "ADMIN";

  if (!session || !isAdmin) {
    return (
      <div className="flex h-[90vh] flex-col items-center justify-center text-center px-4 gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/15 text-destructive">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="max-w-xs flex flex-col gap-2">
          <h2 className="text-xl font-extrabold">Access Denied</h2>
          <p className="text-sm text-muted-foreground">
            You do not have administrative privileges to access this control console. Please login as admin.
          </p>
        </div>
        <div className="flex gap-4">
          <Link
            href="/login"
            className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
          >
            Switch to Admin Login
          </Link>
          <Link
            href="/"
            className="rounded-full border border-border px-5 py-2.5 text-xs font-bold hover:bg-muted/50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const sidebarLinks = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-4.5 w-4.5" /> },
    { name: "Menu Management", href: "/admin/menu", icon: <UtensilsCrossed className="h-4.5 w-4.5" /> },
    { name: "Order Tracker", href: "/admin/orders", icon: <ClipboardList className="h-4.5 w-4.5" /> },
  ];

  const currentSection = sidebarLinks.find((link) => link.href === pathname)?.name || "Admin Panel";

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-background border-t border-border relative">
      {/* Mobile Top Sub-Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card sticky top-16 z-30 shadow-xs">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-primary/30 bg-primary/10 text-xs font-extrabold text-primary hover:bg-primary/20 transition-colors shadow-xs"
        >
          <PanelLeftOpen className="h-4.5 w-4.5" />
          <span>Admin Navigation</span>
        </button>
        <span className="text-xs font-extrabold text-foreground tracking-wide">{currentSection}</span>
      </div>

      {/* Backdrop Overlay for Mobile Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-[90] bg-black/75 backdrop-blur-sm md:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Panel - Hidden on mobile unless toggled open */}
      <aside
        className={`${
          isMobileOpen
            ? "flex fixed inset-y-0 left-0 z-[100] w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200"
            : "hidden md:flex"
        } md:static md:w-64 flex-col bg-card border-r border-border shrink-0 min-h-screen`}
      >
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-wider uppercase text-primary">Admin Console</span>
            <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary">
              SECURE
            </span>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
            title="Close navigation menu"
          >
            <X className="h-4 w-4" />
            <span>Close</span>
          </button>
        </div>

        <nav className="flex-grow p-4 flex flex-col gap-1.5">
          {sidebarLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground transition-all hover:bg-muted/30"
          >
            <Home className="h-4.5 w-4.5" />
            Customer View
          </Link>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden mt-2 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-border bg-muted/30 text-xs font-bold text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Close Admin Menu
          </button>
        </div>
      </aside>

      {/* Main Administrative Screen */}
      <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-y-auto">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}


