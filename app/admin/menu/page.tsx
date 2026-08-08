"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, CheckCircle2, Star, Image as ImageIcon } from "lucide-react";

// Fetch helpers
async function fetchMenu() {
  const res = await fetch("/api/menu");
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

export default function AdminMenuPage() {
  const queryClient = useQueryClient();

  // Queries
  const { data: menuItems, isLoading } = useQuery({ queryKey: ["adminMenu"], queryFn: fetchMenu });
  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: fetchCategories });
  const { data: cuisines } = useQuery({ queryKey: ["cuisines"], queryFn: fetchCuisines });

  // Dialog State
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [cuisineId, setCuisineId] = useState("");
  const [image, setImage] = useState("");
  const [veg, setVeg] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [available, setAvailable] = useState(true);
  const [preparationTime, setPreparationTime] = useState("20");

  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setImage(data.url);
      } else {
        setError(data.error || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Network error uploading image.");
    } finally {
      setUploading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setOfferPrice("");
    setCategoryId(categories?.[0]?.id || "");
    setCuisineId(cuisines?.[0]?.id || "");
    setImage("");
    setVeg(true);
    setFeatured(false);
    setAvailable(true);
    setPreparationTime("20");
    setError("");
    setIsOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setDescription(item.description);
    setPrice(item.price.toString());
    setOfferPrice(item.offerPrice ? item.offerPrice.toString() : "");
    setCategoryId(item.categoryId);
    setCuisineId(item.cuisineId);
    setImage(item.image || "");
    setVeg(item.veg);
    setFeatured(item.featured);
    setAvailable(item.available);
    setPreparationTime(item.preparationTime.toString());
    setError("");
    setIsOpen(true);
  };

  // Mutations
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const isEdit = !!editingId;
      const url = isEdit ? `/api/menu/${editingId}` : "/api/menu";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save menu item");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenu"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["featuredMenu"] });
      setIsOpen(false);
    },
    onError: (err: any) => {
      setError(err.message || "An error occurred");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete menu item");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminMenu"] });
      queryClient.invalidateQueries({ queryKey: ["menu"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["featuredMenu"] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description || !price || !categoryId || !cuisineId) {
      setError("Please fill out all required fields.");
      return;
    }

    const payload = {
      name,
      description,
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : null,
      categoryId,
      cuisineId,
      image: image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500",
      veg,
      featured,
      available,
      preparationTime: Number(preparationTime),
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Menu Items</h1>
          <p className="text-sm text-muted-foreground">Manage your dishes, descriptions, categories, and offers.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="rounded-full bg-primary hover:bg-primary/95 text-primary-foreground py-2.5 px-5 text-xs font-bold gap-1.5 flex items-center shadow-md cursor-pointer self-start sm:self-center"
        >
          <Plus className="h-4.5 w-4.5" />
          Add New Dish
        </button>
      </div>

      {/* Items Table / Mobile Cards Card */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm flex flex-col">
        {isLoading ? (
          <div className="p-8 text-center flex flex-col items-center gap-2">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-muted-foreground font-semibold">Loading menu items list...</p>
          </div>
        ) : !menuItems || menuItems.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center gap-2 border-dashed border-border p-6">
            <span className="text-3xl">🍲</span>
            <h3 className="font-extrabold text-base">No Menu Items</h3>
            <p className="text-xs text-muted-foreground max-w-xs">Click Add New Dish to add culinary items to your menu.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs font-semibold">
                <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">
                  <tr>
                    <th className="px-6 py-3.5">Item</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Availability</th>
                    <th className="px-6 py-3.5">Status Info</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {menuItems.map((item: any) => (
                    <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img
                          src={item.image || "/images/menu/default.svg"}
                          alt={item.name}
                          className="h-10 w-10 rounded-lg object-cover bg-muted shrink-0 border border-border"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                            {item.description}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-medium">
                        {item.category?.name || "Uncategorized"}
                      </td>
                      <td className="px-6 py-4 text-foreground">
                        <span className="font-extrabold">₹{item.offerPrice ?? item.price}</span>
                        {item.offerPrice && (
                          <span className="text-[10px] text-muted-foreground line-through ml-1.5">
                            ₹{item.price}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.available
                            ? "bg-green-500/10 border-green-500/20 text-green-500"
                            : "bg-red-500/10 border-red-500/20 text-red-500"
                        }`}>
                          {item.available ? "In Stock" : "Out of Stock"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {item.veg ? (
                            <span className="rounded-full bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 text-[9px] font-bold text-green-500">
                              VEG
                            </span>
                          ) : (
                            <span className="rounded-full bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 text-[9px] font-bold text-red-500">
                              NON-VEG
                            </span>
                          )}
                          {item.featured && (
                            <span className="rounded-full bg-primary/10 border border-primary/20 px-1.5 py-0.5 text-[9px] font-bold text-primary">
                              STAR
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-muted rounded-md transition-colors"
                            title="Edit Item"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                                deleteMutation.mutate(item.id);
                              }
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-muted rounded-md transition-colors"
                            title="Delete Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className="md:hidden divide-y divide-border/60">
              {menuItems.map((item: any) => (
                <div key={item.id} className="p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image || "/images/menu/default.svg"}
                      alt={item.name}
                      className="h-12 w-12 rounded-xl object-cover bg-muted shrink-0 border border-border"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-sm text-foreground truncate">{item.name}</h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-1">{item.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-black text-xs text-primary">₹{item.offerPrice ?? item.price}</span>
                        {item.offerPrice && (
                          <span className="text-[10px] text-muted-foreground line-through">₹{item.price}</span>
                        )}
                        <span className="text-[10px] font-bold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-md">
                          {item.category?.name || "Cat"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1.5 items-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${
                        item.available ? "bg-green-500/10 border-green-500/20 text-green-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                      }`}>
                        {item.available ? "In Stock" : "Out of Stock"}
                      </span>
                      {item.veg ? (
                        <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[9px] font-bold text-green-500">
                          VEG
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] font-bold text-red-500">
                          NON-VEG
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-3 py-1 text-xs font-bold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${item.name}?`)) {
                            deleteMutation.mutate(item.id);
                          }
                        }}
                        className="px-3 py-1 text-xs font-bold text-destructive bg-destructive/10 rounded-lg hover:bg-destructive/20 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Modal Dialog Panel - Mobile Friendly Overflow & Heights */}
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
          <div className="w-full max-w-2xl max-h-[85vh] sm:max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl my-auto overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex justify-between items-center bg-card shrink-0">
              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground">
                  {editingId ? "Modify Menu Item" : "Create New Menu Item"}
                </h3>
                <p className="text-[11px] text-muted-foreground">Fill in details for your culinary offering.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center h-8 w-8 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted font-extrabold transition-colors"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Scrollable Content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 text-xs font-semibold">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item Name */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Dish Name *</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Margherita Pizza"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-border rounded-xl bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                </div>

                {/* Preparation Time */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Prep Time (Mins) *</label>
                  <input
                    required
                    type="number"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(e.target.value)}
                    className="w-full border border-border rounded-xl bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe ingredients, culinary style, textures..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-border rounded-xl bg-background p-3 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Regular Price (₹) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="299"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full border border-border rounded-xl bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                </div>

                {/* Offer Price */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Special Offer Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="249 (Optional)"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full border border-border rounded-xl bg-background px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full border border-border rounded-xl bg-background p-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
                  >
                    {categories?.map((cat: any) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cuisine Selection */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Cuisine *</label>
                  <select
                    value={cuisineId}
                    onChange={(e) => setCuisineId(e.target.value)}
                    className="w-full border border-border rounded-xl bg-background p-2.5 text-sm focus:outline-none focus:border-primary text-foreground"
                  >
                    {cuisines?.map((cui: any) => (
                      <option key={cui.id} value={cui.id}>
                        {cui.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload / URL Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">Dish Image</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* File Upload Input */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">Upload from device (Gallery/File Explorer)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="w-full border border-border rounded-xl bg-background text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/15 file:text-primary hover:file:bg-primary/25 cursor-pointer p-1.5 focus:outline-none"
                    />
                    {uploading && <span className="text-[10px] text-primary animate-pulse font-semibold">Uploading image...</span>}
                  </div>

                  {/* URL Text Input */}
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] text-muted-foreground">Or paste Image URL directly</span>
                    <div className="relative">
                      <ImageIcon className="absolute top-3 left-3 h-4.5 w-4.5 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-xl bg-background text-xs focus:outline-none focus:border-primary text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {image && (
                  <div className="mt-1 flex items-center gap-3 p-2 rounded-xl border border-border bg-muted/20">
                    <img src={image} alt="Preview" className="h-10 w-10 object-cover rounded-lg border border-border" />
                    <span className="text-[10px] text-muted-foreground truncate max-w-[280px]">{image}</span>
                  </div>
                )}
              </div>

              {/* Flags Switch Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border border-border p-3.5 rounded-2xl bg-muted/20">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={veg}
                    onChange={(e) => setVeg(e.target.checked)}
                    className="h-4.5 w-4.5 accent-primary cursor-pointer"
                  />
                  <span className="text-xs">Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="h-4.5 w-4.5 accent-primary cursor-pointer"
                  />
                  <span className="text-xs">Featured Spec</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="h-4.5 w-4.5 accent-primary cursor-pointer"
                  />
                  <span className="text-xs">In Stock</span>
                </label>
              </div>

              {error && <p className="text-xs font-semibold text-red-500 text-center">{error}</p>}

              {/* Modal Footer Buttons */}
              <div className="flex gap-3 justify-end border-t border-border/50 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-border px-5 py-2.5 text-xs font-bold hover:bg-muted/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-xs font-bold hover:bg-primary/95 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Dish"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
