"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Star, Clock, ShoppingCart, Sparkles, ShieldCheck, Flame, Award } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { motion } from "framer-motion";

// Fetch menu items for featured section
async function fetchFeaturedMenu() {
  const res = await fetch("/api/menu?featured=true");
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export default function LandingPage() {
  const { addToCart } = useCartStore();
  
  const { data: featuredItems, isLoading: menuLoading } = useQuery({
    queryKey: ["featuredMenu"],
    queryFn: fetchFeaturedMenu,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/20 via-background to-background py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex flex-col gap-6 text-center lg:text-left"
            >
              <div className="inline-flex self-center lg:self-start items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                <span>Indulge in Gourmet Pleasures</span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-foreground">
                Savor the Art of <span className="text-primary bg-clip-text bg-gradient-to-r from-primary to-secondary">Fine Dining</span> Delivered to You
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Fresh ingredients, aromatic spices, and chef-crafted perfection. Experience premium culinary delights in the comfort of your home.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-base font-medium text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02]"
                >
                  Explore Menu
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="#specials"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-base font-medium hover:bg-muted/50 transition-all"
                >
                  Today's Specials
                </Link>
              </div>
            </motion.div>

            {/* Right Graphic */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative mx-auto lg:mx-0 flex justify-center items-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full filter blur-3xl opacity-20 -z-10 animate-pulse"></div>
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80"
                alt="Delicious Gourmet Dish"
                className="rounded-3xl shadow-2xl object-cover aspect-video max-w-full lg:max-w-md border border-border"
              />
              <div className="absolute -bottom-6 -left-6 bg-card border border-border rounded-2xl p-4 shadow-xl flex items-center gap-3 animate-bounce duration-1000">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/15 text-secondary">
                  <Flame className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Fast Prep Time</p>
                  <p className="text-sm font-bold">15 - 20 Mins</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. Welcome Promo Banner */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 border border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <h3 className="text-lg font-bold">🎉 Welcome Offer: Save 10% on your first order!</h3>
            <p className="text-sm text-muted-foreground">Apply coupon <span className="font-mono text-primary font-bold">WELCOME10</span> at checkout.</p>
          </div>
          <Link
            href="/menu"
            className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-colors shadow-md shrink-0"
          >
            Order Now
          </Link>
        </div>
      </section>

      {/* 3. Categories List */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Popular Categories</h2>
              <p className="text-sm text-muted-foreground">What are you craving today?</p>
            </div>
            <Link href="/menu" className="text-primary hover:underline text-sm font-medium flex items-center gap-1">
              View Menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {categoriesLoading
              ? Array(6).fill(null).map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse"></div>
                ))
              : categories?.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={`/menu?categoryId=${cat.id}`}
                    className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary transition-all hover:-translate-y-1 shadow-sm"
                  >
                    <img
                      src={cat.image || "/images/categories/default.svg"}
                      alt={cat.name}
                      className="h-12 w-12 rounded-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className="text-sm font-bold text-center group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      {/* 4. Specials Section (Featured) */}
      <section id="specials" className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="text-center md:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Chef's Today Specials</h2>
            <p className="text-sm text-muted-foreground">Handpicked delicacies prepared with local farm-fresh ingredients.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {menuLoading
              ? Array(3).fill(null).map((_, i) => (
                  <div key={i} className="h-[380px] rounded-2xl bg-muted animate-pulse"></div>
                ))
              : featuredItems?.slice(0, 3).map((item: any) => (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-primary/50 group"
                  >
                    {/* Item Image */}
                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                      <img
                        src={item.image || "/images/menu/default.svg"}
                        alt={item.name}
                        className="h-full w-full object-cover group-hover:scale-102 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {item.veg ? (
                          <span className="rounded-full bg-green-500/15 border border-green-500/30 px-2 py-0.5 text-xs font-semibold text-green-500 backdrop-blur-md">
                            Veg
                          </span>
                        ) : (
                          <span className="rounded-full bg-red-500/15 border border-red-500/30 px-2 py-0.5 text-xs font-semibold text-red-500 backdrop-blur-md">
                            Non-Veg
                          </span>
                        )}
                        {item.offerPrice && (
                          <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20">
                            Offer
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="flex flex-col flex-grow p-5 gap-3.5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm font-bold text-secondary">
                          <Star className="h-4 w-4 fill-secondary" />
                          <span>{item.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mt-auto">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{item.preparationTime} mins</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-xl font-extrabold text-foreground">
                            ₹{item.offerPrice ?? item.price}
                          </span>
                          {item.offerPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{item.price}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => addToCart(item.id, 1)}
                          className="flex h-9 items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-4 text-sm font-semibold gap-1.5 shadow-sm shadow-primary/10 transition-colors"
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* 5. Trust Metrics */}
      <section className="bg-card/50 border-y border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">Top Rated Chefs</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Prepared by award-winning culinary professionals passionate about taste.</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">Hygiene Standards</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Strict safety protocols followed from farm sourcing to delivery.</p>
            </div>
            <div className="flex flex-col items-center gap-3 p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg">Express Delivery</h3>
              <p className="text-sm text-muted-foreground max-w-xs">Hot, steaming, and fresh food delivered to your door in minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Review Feed */}
      <section className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Loved by Foodies</h2>
            <p className="text-sm text-muted-foreground">What our happy food lovers are saying about GustoBites.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-4 rounded-2xl bg-card border border-border p-6 shadow-sm">
              <div className="flex items-center gap-1.5 text-secondary">
                {Array(5).fill(null).map((_, i) => <Star key={i} className="h-4 w-4 fill-secondary" />)}
              </div>
              <p className="text-sm italic text-muted-foreground">
                "The Butter Chicken is pure heaven! Melt-in-the-mouth chicken pieces in a beautifully creamy sauce. Delivery was fast too!"
              </p>
              <div className="flex items-center gap-2 mt-auto border-t border-border/50 pt-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">J</div>
                <span className="text-sm font-semibold">Jennifer A.</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-card border border-border p-6 shadow-sm">
              <div className="flex items-center gap-1.5 text-secondary">
                {Array(5).fill(null).map((_, i) => <Star key={i} className="h-4 w-4 fill-secondary" />)}
              </div>
              <p className="text-sm italic text-muted-foreground">
                "Best Margherita pizza I've had outside Italy! The crust is so soft and crispy, the mozzarella is rich and bubbly."
              </p>
              <div className="flex items-center gap-2 mt-auto border-t border-border/50 pt-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">R</div>
                <span className="text-sm font-semibold">Robert D.</span>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl bg-card border border-border p-6 shadow-sm">
              <div className="flex items-center gap-1.5 text-secondary">
                {Array(4).fill(null).map((_, i) => <Star key={i} className="h-4 w-4 fill-secondary" />)}
                <Star className="h-4 w-4" />
              </div>
              <p className="text-sm italic text-muted-foreground">
                "Really solid cheeseburgers! The meat is extremely juicy, bun is toasted, and their secret sauce is delicious."
              </p>
              <div className="flex items-center gap-2 mt-auto border-t border-border/50 pt-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">A</div>
                <span className="text-sm font-semibold">Alex M.</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
