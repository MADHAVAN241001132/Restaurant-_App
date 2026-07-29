"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Star, Clock, ShoppingCart, Search, SlidersHorizontal, Check, RefreshCw, ChevronRight, X } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useFilterStore } from "@/store/useFilterStore";
import { motion, AnimatePresence } from "framer-motion";

// Helper fetchers
async function fetchMenu(filters: any) {
  const query = new URLSearchParams();
  if (filters.categoryId) query.append("categoryId", filters.categoryId);
  if (filters.cuisineId) query.append("cuisineId", filters.cuisineId);
  if (filters.search) query.append("search", filters.search);
  if (filters.veg) query.append("veg", filters.veg);
  if (filters.sort) query.append("sort", filters.sort);

  const res = await fetch(`/api/menu?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch menu");
  return res.json();
}

async function fetchCategories() {
  const res = await fetch("/api/categories");
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

async function fetchCuisines() {
  const res = await fetch("/api/cuisines");
  if (!res.ok) throw new Error("Failed to fetch cuisines");
  return res.json();
}

export default function MenuPage() {
  const { addToCart } = useCartStore();
  const filters = useFilterStore();
  
  // Customizer Modal State
  const [customizingItem, setCustomizingItem] = useState<any | null>(null);
  const [spiceLevel, setSpiceLevel] = useState("Medium");
  const [extraCheese, setExtraCheese] = useState(false);
  const [portionSize, setPortionSize] = useState("Regular");

  // Fetch queries
  const { data: menuItems, isLoading: menuLoading } = useQuery({
    queryKey: ["menu", filters.categoryId, filters.cuisineId, filters.search, filters.veg, filters.sort],
    queryFn: () => fetchMenu(filters),
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  const { data: cuisines } = useQuery({
    queryKey: ["cuisines"],
    queryFn: fetchCuisines,
  });

  const handleOpenCustomizer = (item: any) => {
    setCustomizingItem(item);
    setSpiceLevel("Medium");
    setExtraCheese(false);
    setPortionSize("Regular");
  };

  const handleAddCustomized = () => {
    if (customizingItem) {
      const customization = {
        spiceLevel,
        extraCheese,
        portionSize,
      };
      addToCart(customizingItem.id, 1, customization);
      setCustomizingItem(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 lg:px-8 flex flex-col gap-8">
      {/* 1. Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Our Gourmet Menu</h1>
          <p className="text-sm text-muted-foreground">Select from fresh, premium gourmet creations cooked daily.</p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute top-2.5 left-3 h-4.5 w-4.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={filters.search}
            onChange={(e) => filters.setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-border rounded-full bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 2. Left Sidebar Filter Panel (Desktop) */}
        <div className="hidden lg:flex flex-col gap-6 border-r border-border/50 pr-6">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
              Filters
            </h3>
            <button
              onClick={() => filters.resetFilters()}
              className="text-xs text-primary font-semibold hover:underline flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reset All
            </button>
          </div>

          {/* Sort Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => filters.setSort(e.target.value)}
              className="w-full border border-border rounded-lg bg-card text-foreground p-2.5 text-sm focus:outline-none focus:border-primary"
            >
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Veg Preference */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Preference</label>
            <div className="flex gap-2">
              <button
                onClick={() => filters.setVeg(filters.veg === "true" ? null : "true")}
                className={`flex-1 rounded-lg border py-2 text-center text-xs font-bold transition-all ${
                  filters.veg === "true"
                    ? "border-green-500 bg-green-500/10 text-green-500"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                Veg Only
              </button>
              <button
                onClick={() => filters.setVeg(filters.veg === "false" ? null : "false")}
                className={`flex-1 rounded-lg border py-2 text-center text-xs font-bold transition-all ${
                  filters.veg === "false"
                    ? "border-red-500 bg-red-500/10 text-red-500"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                Non-Veg Only
              </button>
            </div>
          </div>

          {/* Categories Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Categories</label>
            <div className="flex flex-col gap-1 text-sm font-medium text-muted-foreground">
              <button
                onClick={() => filters.setCategoryId(null)}
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors hover:text-foreground hover:bg-muted/30 ${
                  filters.categoryId === null ? "text-primary font-bold bg-primary/5" : ""
                }`}
              >
                <span>All Categories</span>
                {filters.categoryId === null && <Check className="h-4 w-4" />}
              </button>
              {categories?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => filters.setCategoryId(cat.id)}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors hover:text-foreground hover:bg-muted/30 ${
                    filters.categoryId === cat.id ? "text-primary font-bold bg-primary/5" : ""
                  }`}
                >
                  <span>{cat.name}</span>
                  {filters.categoryId === cat.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Cuisines Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cuisines</label>
            <div className="flex flex-col gap-1 text-sm font-medium text-muted-foreground">
              <button
                onClick={() => filters.setCuisineId(null)}
                className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors hover:text-foreground hover:bg-muted/30 ${
                  filters.cuisineId === null ? "text-primary font-bold bg-primary/5" : ""
                }`}
              >
                <span>All Cuisines</span>
                {filters.cuisineId === null && <Check className="h-4 w-4" />}
              </button>
              {cuisines?.map((cui: any) => (
                <button
                  key={cui.id}
                  onClick={() => filters.setCuisineId(cui.id)}
                  className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-left transition-colors hover:text-foreground hover:bg-muted/30 ${
                    filters.cuisineId === cui.id ? "text-primary font-bold bg-primary/5" : ""
                  }`}
                >
                  <span>{cui.name}</span>
                  {filters.cuisineId === cui.id && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Right Menu Catalog Display */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Quick Category Bar (Mobile/Tablet Friendly Scrolling) */}
          <div className="flex lg:hidden overflow-x-auto pb-2 gap-2 scrollbar-none">
            <button
              onClick={() => filters.setCategoryId(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold shrink-0 border transition-all ${
                filters.categoryId === null ? "bg-primary border-primary text-primary-foreground" : "border-border bg-card"
              }`}
            >
              All Dishes
            </button>
            {categories?.map((cat: any) => (
              <button
                key={cat.id}
                onClick={() => filters.setCategoryId(cat.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold shrink-0 border transition-all ${
                  filters.categoryId === cat.id ? "bg-primary border-primary text-primary-foreground" : "border-border bg-card"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Dishes Grid */}
          {menuLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array(6)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="h-[360px] rounded-2xl bg-card border border-border animate-pulse flex flex-col p-5 gap-4">
                    <div className="w-full aspect-video rounded-xl bg-muted"></div>
                    <div className="h-6 w-3/4 bg-muted rounded"></div>
                    <div className="h-4 w-full bg-muted rounded"></div>
                    <div className="h-10 w-full bg-muted rounded mt-auto"></div>
                  </div>
                ))}
            </div>
          ) : menuItems?.length === 0 ? (
            <div className="flex flex-col items-center justify-between justify-center py-20 border border-dashed border-border rounded-3xl bg-card gap-3">
              <span className="text-4xl">🍕</span>
              <h3 className="font-extrabold text-lg">No Dishes Found</h3>
              <p className="text-sm text-muted-foreground text-center max-w-xs">
                We couldn't find any dishes matching your query. Try resetting your filter settings.
              </p>
              <button
                onClick={() => filters.resetFilters()}
                className="mt-2 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/95 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <AnimatePresence mode="popLayout">
                {menuItems?.map((item: any) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
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
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground shadow-md shadow-primary/20">
                            Offer
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-col flex-grow p-5 gap-3">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-base leading-tight group-hover:text-primary transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm font-bold text-secondary shrink-0">
                          <Star className="h-3.5 w-3.5 fill-secondary" />
                          <span>{item.rating}</span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mt-auto">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{item.preparationTime} mins prep</span>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-extrabold text-foreground">
                            ₹{item.offerPrice ?? item.price}
                          </span>
                          {item.offerPrice && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{item.price}
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => handleOpenCustomizer(item)}
                          className="flex h-8 items-center justify-center rounded-lg bg-primary hover:bg-primary/95 text-primary-foreground px-3.5 text-xs font-semibold gap-1.5 shadow-sm shadow-primary/10 transition-colors"
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />
                          Add
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* 4. Glassmorphic Food Customizer Dialog Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header image */}
            <div className="relative h-48 bg-muted">
              <img
                src={customizingItem.image || "/images/menu/default.svg"}
                alt={customizingItem.name}
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => setCustomizingItem(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 hover:bg-black/75 text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal details */}
            <div className="p-6 flex flex-col gap-5">
              <div>
                <h3 className="text-xl font-bold">{customizingItem.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{customizingItem.description}</p>
              </div>

              {/* Spice Level selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Spice Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Mild", "Medium", "Spicy"].map((level) => (
                    <button
                      key={level}
                      onClick={() => setSpiceLevel(level)}
                      className={`rounded-xl border py-2 text-center text-xs font-semibold transition-all ${
                        spiceLevel === level
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portion size selection */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Portion Size</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Regular", "Large (+ ₹50)"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setPortionSize(size.split(" ")[0])}
                      className={`rounded-xl border py-2 text-center text-xs font-semibold transition-all ${
                        portionSize === size.split(" ")[0]
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Addons checkbox */}
              <div className="flex items-center justify-between border-t border-border/50 pt-4">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Extra Mozzarella Cheese</span>
                  <span className="text-xs text-muted-foreground">+ ₹30</span>
                </div>
                <input
                  type="checkbox"
                  checked={extraCheese}
                  onChange={(e) => setExtraCheese(e.target.checked)}
                  className="h-5 w-5 rounded border-border text-primary focus:ring-primary accent-primary"
                />
              </div>

              {/* Footer pricing & Add trigger */}
              <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-xl font-extrabold text-primary">
                    ₹
                    {(
                      (customizingItem.offerPrice ?? customizingItem.price) +
                      (extraCheese ? 30 : 0) +
                      (portionSize === "Large" ? 50 : 0)
                    ).toFixed(2)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCustomizingItem(null)}
                    className="rounded-xl border border-border px-4 py-2.5 text-xs font-semibold hover:bg-muted/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomized}
                    className="rounded-xl bg-primary hover:bg-primary/95 text-primary-foreground px-6 py-2.5 text-xs font-bold gap-1.5 flex items-center shadow-lg shadow-primary/15 transition-all hover:scale-[1.02]"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Confirm Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
