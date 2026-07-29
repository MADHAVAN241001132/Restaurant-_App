import { create } from "zustand";

export interface CartItem {
  id: string;
  userId: string;
  menuItemId: string;
  quantity: number;
  customization: string | null;
  menuItem: {
    id: string;
    name: string;
    description: string;
    price: number;
    offerPrice: number | null;
    image: string | null;
    veg: boolean;
    preparationTime: number;
    rating: number;
  };
}

export interface Coupon {
  code: string;
  discount: number;
  type: string;
  rate: number;
}

interface CartState {
  cart: CartItem[];
  loading: boolean;
  coupon: Coupon | null;
  discount: number;
  fetchCart: () => Promise<void>;
  addToCart: (menuItemId: string, quantity: number, customization?: any) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeFromCart: (id: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  removeCoupon: () => void;
  getTotals: () => { subtotal: number; tax: number; delivery: number; discount: number; total: number };
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: [],
  loading: false,
  coupon: null,
  discount: 0,

  fetchCart: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        set({ cart: data });
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    } finally {
      set({ loading: false });
    }
  },

  addToCart: async (menuItemId, quantity, customization) => {
    set({ loading: true });
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuItemId, quantity, customization }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ cart: data });
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      set({ loading: false });
    }
  },

  updateQuantity: async (id, quantity) => {
    // Optimistic update
    const previousCart = get().cart;
    set({
      cart: previousCart
        .map((item) => (item.id === id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    });

    try {
      const res = await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        set({ cart: data });
      } else {
        // Rollback
        set({ cart: previousCart });
      }
    } catch (err) {
      console.error("Failed to update cart quantity:", err);
      set({ cart: previousCart });
    }
  },

  removeFromCart: async (id) => {
    // Optimistic update
    const previousCart = get().cart;
    set({ cart: previousCart.filter((item) => item.id !== id) });

    try {
      const res = await fetch(`/api/cart?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        const data = await res.json();
        set({ cart: data });
      } else {
        set({ cart: previousCart });
      }
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      set({ cart: previousCart });
    }
  },

  clearCart: async () => {
    set({ cart: [] });
    try {
      await fetch("/api/cart", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  },

  applyCoupon: async (code) => {
    const { subtotal } = get().getTotals();
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, cartSubtotal: subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const couponData: Coupon = {
          code: data.code,
          discount: data.discount,
          type: data.type,
          rate: data.rate,
        };
        set({ coupon: couponData, discount: data.discount });
        return { success: true, message: `Coupon ${code} applied successfully!` };
      } else {
        return { success: false, error: data.error || "Failed to apply coupon" };
      }
    } catch (err) {
      console.error("Coupon apply error:", err);
      return { success: false, error: "Network error applying coupon" };
    }
  },

  removeCoupon: () => {
    set({ coupon: null, discount: 0 });
  },

  getTotals: () => {
    const cart = get().cart;
    const subtotal = cart.reduce((sum, item) => {
      const price = item.menuItem.offerPrice ?? item.menuItem.price;
      return sum + price * item.quantity;
    }, 0);

    const delivery = subtotal > 30 || subtotal === 0 ? 0 : 3.99; // Free delivery for orders above $30
    const tax = subtotal * 0.05; // 5% GST/tax

    // Recompute coupon discount dynamically based on subtotal changes
    let currentDiscount = 0;
    const coupon = get().coupon;
    if (coupon) {
      if (coupon.type === "PERCENTAGE") {
        currentDiscount = (subtotal * coupon.rate) / 100;
      } else {
        currentDiscount = Math.min(coupon.rate, subtotal);
      }
    }

    const total = Math.max(0, subtotal + tax + delivery - currentDiscount);

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      delivery,
      discount: Math.round(currentDiscount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  },
}));
