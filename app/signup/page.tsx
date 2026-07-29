"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, ArrowRight, Utensils } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setError("");
    setLoading(true);

    try {
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const registerData = await registerRes.json();

      if (!registerRes.ok) {
        setError(registerData.error || "Registration failed. Please try again.");
        setLoading(false);
        return;
      }

      // Auto login user after successful signup
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (loginRes?.error) {
        router.push("/login");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Signup error:", err);
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
          <h2 className="text-2xl font-extrabold tracking-tight">Create Account</h2>
          <p className="text-xs text-muted-foreground">Sign up to enjoy gourmet food orderings and exclusive offers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
            <div className="relative">
              <User className="absolute top-3 left-3 h-4.5 w-4.5 text-muted-foreground" />
              <input
                required
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Email Address</label>
            <div className="relative">
              <Mail className="absolute top-3 left-3 h-4.5 w-4.5 text-muted-foreground" />
              <input
                required
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mobile Phone (Optional)</label>
            <div className="relative">
              <Phone className="absolute top-3 left-3 h-4.5 w-4.5 text-muted-foreground" />
              <input
                type="tel"
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary text-foreground"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Choose Password</label>
            <div className="relative">
              <Lock className="absolute top-3 left-3 h-4.5 w-4.5 text-muted-foreground" />
              <input
                required
                type="password"
                placeholder="Min 6 characters"
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
                Creating account...
              </span>
            ) : (
              <>
                Register Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground font-medium border-t border-border/50 pt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline font-bold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
