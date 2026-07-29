import { create } from "zustand";

interface FilterState {
  search: string;
  categoryId: string | null;
  cuisineId: string | null;
  veg: string | null; // "true" or "false" or null
  sort: string; // "price-asc" | "price-desc" | "rating" | "newest"
  setSearch: (search: string) => void;
  setCategoryId: (id: string | null) => void;
  setCuisineId: (id: string | null) => void;
  setVeg: (veg: string | null) => void;
  setSort: (sort: string) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  search: "",
  categoryId: null,
  cuisineId: null,
  veg: null,
  sort: "newest",

  setSearch: (search) => set({ search }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setCuisineId: (cuisineId) => set({ cuisineId }),
  setVeg: (veg) => set({ veg }),
  setSort: (sort) => set({ sort }),

  resetFilters: () =>
    set({
      search: "",
      categoryId: null,
      cuisineId: null,
      veg: null,
      sort: "newest",
    }),
}));
