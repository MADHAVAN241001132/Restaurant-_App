"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ShoppingCart, User, Menu as MenuIcon, X, Utensils, LogOut, LayoutDashboard, History } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cart, fetchCart } = useCartStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, session]);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const userRole = (session?.user as any)?.role || "CUSTOMER";
  const isAdmin = userRole === "ADMIN";

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Menu", href: "/menu" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-primary">
          <Utensils className="h-6 w-6" />
          <span>Gusto<span className="text-foreground font-light">Bites</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8 font-medium text-sm text-muted-foreground">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-primary transition-colors ${
                pathname === link.href ? "text-primary font-semibold" : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-between justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                <span className="mx-auto">{totalItems}</span>
              </span>
            )}
          </Link>

          {session ? (
            <div className="relative flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1 rounded-full bg-secondary/10 px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-secondary/20 transition-colors"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Admin
                </Link>
              )}
              <Link
                href="/orders"
                className="flex items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted/50 transition-colors"
              >
                <History className="h-3.5 w-3.5" />
                My Orders
              </Link>
              <div className="flex items-center gap-2 rounded-full border border-border p-1 bg-card pr-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
                <span className="text-xs font-semibold max-w-[80px] truncate">{session.user?.name}</span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors ml-1"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium hover:text-primary transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/20 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/cart" className="relative p-2 text-foreground">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                <span>{totalItems}</span>
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background px-4 py-4 md:hidden animate-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-4 font-medium text-muted-foreground mb-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`hover:text-primary transition-colors ${
                  pathname === link.href ? "text-primary font-semibold" : ""
                }`}
              >
                {link.name}
              </Link>
            ))}
            {session && (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`hover:text-primary transition-colors ${
                    pathname === "/orders" ? "text-primary font-semibold" : ""
                  }`}
                >
                  My Orders
                </Link>
                {isAdmin && (
                  <div className="flex flex-col gap-2 pt-2 border-t border-border/40">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-secondary">Admin Console</span>
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-xs font-bold transition-colors ${
                        pathname === "/admin/dashboard" ? "text-secondary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      📊 Dashboard
                    </Link>
                    <Link
                      href="/admin/menu"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-xs font-bold transition-colors ${
                        pathname === "/admin/menu" ? "text-secondary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🍲 Menu Management
                    </Link>
                    <Link
                      href="/admin/orders"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-xs font-bold transition-colors ${
                        pathname === "/admin/orders" ? "text-secondary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      📋 Order Tracker
                    </Link>
                  </div>
                )}
              </>
            )}
          </nav>
          <hr className="border-border my-4" />
          {session ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                  {session.user?.name?.charAt(0) || "U"}
                </div>
                <span className="text-sm font-semibold">{session.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex items-center gap-1.5 text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex justify-center rounded-lg border border-border py-2 text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex justify-center rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/95 transition-colors"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
