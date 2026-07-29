"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, ArrowRight, Utensils, AlertTriangle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-between justify-center px-4 py-12 sm:px-6 lg:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-border bg-card p-8 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header Logo */}
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Utensils className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-xs text-muted-foreground">Sign in to track orders, manage basket, and apply coupons.</p>
        </div>

        {/* Demo info message */}
        <div className="rounded-xl border border-secondary/20 bg-secondary/5 p-3 flex flex-col gap-1 text-[11px] text-muted-foreground leading-normal">
          <p className="font-bold text-secondary flex items-center gap-1">
            <AlertTriangle className="h-3.5 w-3.5" />
            Local Sandbox Demo Credentials
          </p>
          <p>• <b>Admin Account:</b> admin@restaurant.com (pass: admin123)</p>
          <p>• <b>Customer Account:</b> customer@restaurant.com (pass: customer123)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-4.5 w-4.5 text-muted-foreground" />
              <input
                required
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Password</label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-4.5 w-4.5 text-muted-foreground" />
              <input
                required
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary text-foreground"
              />
            </div>
          </div>

          {error && <p className="text-xs font-semibold text-red-500 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-between justify-center gap-2 rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground py-3 px-4 font-bold shadow-lg shadow-primary/10 transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-75"
          >
            {loading ? (
              <span className="mx-auto flex items-center gap-2 text-sm">
                <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </span>
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground font-medium border-t border-border/50 pt-4">
          New to GustoBites?{" "}
          <Link href="/signup" className="text-primary hover:underline font-bold">
            Create an Account
          </Link>
        </p>
      </div>
    </div>
  );
}
