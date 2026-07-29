export interface Category {
  id: string;
  name: string;
  image: string | null;
  status: string;
}

export interface Cuisine {
  id: string;
  name: string;
  image: string | null;
  status: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  offerPrice: number | null;
  categoryId: string;
  cuisineId: string;
  image: string | null;
  veg: boolean;
  featured: boolean;
  available: boolean;
  preparationTime: number;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Coupon {
  id: string;
  code: string;
  discount: number;
  type: "PERCENTAGE" | "FIXED";
  expiry: string;
  usageLimit: number;
  usedCount: number;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  menuItemId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface CartItem {
  id: string;
  userId: string;
  menuItemId: string;
  menuItem: MenuItem;
  quantity: number;
  customization: string | null;
}

export interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "ACCEPTED" | "PREPARING" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
  subtotal: number;
  tax: number;
  delivery: number;
  discount: number;
  total: number;
  paymentStatus: "PENDING" | "COMPLETED" | "FAILED";
  paymentMethod: "COD" | "RAZORPAY";
  address: string;
  couponCode: string | null;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: string;
    orderId: string;
    menuItemId: string;
    menuItem: MenuItem;
    quantity: number;
    price: number;
    customization: string | null;
  }[];
}

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat_1", name: "Pizza", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
  { id: "cat_2", name: "Burger", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
  { id: "cat_3", name: "Desserts", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
  { id: "cat_4", name: "Beverages", image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
  { id: "cat_5", name: "Main Course", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
  { id: "cat_6", name: "Starter", image: "https://images.unsplash.com/photo-1541014741259-df5290db57a7?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
];

export const MOCK_CUISINES: Cuisine[] = [
  { id: "cui_1", name: "Italian", image: "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
  { id: "cui_2", name: "American", image: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
  { id: "cui_3", name: "Indian", image: "https://images.unsplash.com/photo-1585938338392-50a5999074e7?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
  { id: "cui_4", name: "Chinese", image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
  { id: "cui_5", name: "Mexican", image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60", status: "ACTIVE" },
];

const BASE_MOCK_MENU = [
  {
    id: "menu_1",
    name: "Margherita Pizza",
    description: "Classic Italian pizza with simple fresh ingredients: fresh mozzarella cheese, rich tomato sauce, fragrant basil leaves, and a drizzle of olive oil on a crispy crust.",
    price: 12.99,
    offerPrice: 10.99,
    categoryId: "cat_1",
    cuisineId: "cui_1",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=600&auto=format&fit=crop&q=80",
    veg: true,
    featured: true,
    available: true,
    preparationTime: 15,
    rating: 4.8,
  },
  {
    id: "menu_2",
    name: "Pepperoni Pizza",
    description: "Generous layers of premium spicy pepperoni slices, melted mozzarella cheese, and rich zesty tomato sauce on our signature thin crust.",
    price: 14.99,
    offerPrice: null,
    categoryId: "cat_1",
    cuisineId: "cui_1",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80",
    veg: false,
    featured: false,
    available: true,
    preparationTime: 15,
    rating: 4.6,
  },
  {
    id: "menu_3",
    name: "Classic Cheeseburger",
    description: "Juicy, flame-grilled beef patty topped with melted cheddar cheese, fresh lettuce leaves, sliced ripe tomatoes, pickles, onions, and our special burger house sauce on a toasted brioche bun.",
    price: 9.99,
    offerPrice: 8.49,
    categoryId: "cat_2",
    cuisineId: "cui_2",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
    veg: false,
    featured: true,
    available: true,
    preparationTime: 12,
    rating: 4.7,
  },
  {
    id: "menu_4",
    name: "Paneer Butter Masala",
    description: "Fresh cubes of soft paneer cottage cheese cooked in a rich, velvety, creamy tomato-onion butter gravy flavored with authentic Indian spices.",
    price: 13.99,
    offerPrice: 12.49,
    categoryId: "cat_5",
    cuisineId: "cui_3",
    image: "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80",
    veg: true,
    featured: true,
    available: true,
    preparationTime: 20,
    rating: 4.9,
  },
  {
    id: "menu_5",
    name: "Butter Chicken",
    description: "Tender, tandoori-grilled chicken pieces simmered in a mildly spiced, luxurious butter and cream gravy with aromatic methi leaves.",
    price: 15.99,
    offerPrice: null,
    categoryId: "cat_5",
    cuisineId: "cui_3",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80",
    veg: false,
    featured: true,
    available: true,
    preparationTime: 20,
    rating: 4.9,
  },
  {
    id: "menu_6",
    name: "Garlic Bread with Cheese",
    description: "Toasted french baguette slices brushed with fresh garlic herb butter and topped with a bubbly layer of melted mozzarella cheese.",
    price: 5.99,
    offerPrice: null,
    categoryId: "cat_6",
    cuisineId: "cui_1",
    image: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=600&auto=format&fit=crop&q=80",
    veg: true,
    featured: false,
    available: true,
    preparationTime: 8,
    rating: 4.4,
  },
  {
    id: "menu_7",
    name: "Crispy Spring Rolls",
    description: "Delicate and crispy wrappers filled with shredded fresh vegetables and glass noodles, served with a sweet and sour dipping sauce.",
    price: 6.99,
    offerPrice: 5.49,
    categoryId: "cat_6",
    cuisineId: "cui_4",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80",
    veg: true,
    featured: false,
    available: true,
    preparationTime: 10,
    rating: 4.3,
  },
  {
    id: "menu_8",
    name: "Loaded Nachos",
    description: "Crispy tortilla chips topped with warm cheese sauce, fresh black beans, guacamole, sour cream, pico de gallo, and sliced jalapeños.",
    price: 8.99,
    offerPrice: null,
    categoryId: "cat_6",
    cuisineId: "cui_5",
    image: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80",
    veg: true,
    featured: false,
    available: true,
    preparationTime: 10,
    rating: 4.5,
  },
  {
    id: "menu_9",
    name: "Chocolate Lava Cake",
    description: "Decadent warm chocolate cake with a molten, gooey chocolate center, dusted with powdered sugar and served with vanilla bean ice cream.",
    price: 6.99,
    offerPrice: null,
    categoryId: "cat_3",
    cuisineId: "cui_2",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
    veg: true,
    featured: true,
    available: true,
    preparationTime: 10,
    rating: 4.9,
  },
  {
    id: "menu_10",
    name: "Mango Lassi",
    description: "A traditional, refreshing Indian yogurt drink blended with fresh sweet mango pulp, milk, sugar, and a pinch of cardamom.",
    price: 3.99,
    offerPrice: 2.99,
    categoryId: "cat_4",
    cuisineId: "cui_3",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80",
    veg: true,
    featured: false,
    available: true,
    preparationTime: 5,
    rating: 4.8,
  }
];

export const MOCK_MENU: MenuItem[] = BASE_MOCK_MENU.map(item => ({
  ...item,
  createdAt: new Date(),
  updatedAt: new Date()
})) as MenuItem[];

export const MOCK_COUPONS: Coupon[] = [
  { id: "coup_1", code: "WELCOME10", discount: 10, type: "PERCENTAGE", expiry: "2028-12-31", usageLimit: 100, usedCount: 12 },
  { id: "coup_2", code: "FLAT50", discount: 50, type: "FIXED", expiry: "2028-12-31", usageLimit: 50, usedCount: 5 },
];

export const MOCK_REVIEWS: Review[] = [
  { id: "rev_1", userId: "cust_1", userName: "John Doe", menuItemId: "menu_4", rating: 5, comment: "This paneer butter masala is out of this world! So creamy and perfectly spiced.", createdAt: "2026-07-15T12:00:00Z" },
  { id: "rev_2", userId: "cust_1", userName: "John Doe", menuItemId: "menu_3", rating: 4, comment: "Very solid cheeseburger. Patty was juicy and bun was nice and soft.", createdAt: "2026-07-16T14:30:00Z" },
  { id: "rev_3", userId: "cust_2", userName: "Jane Smith", menuItemId: "menu_1", rating: 5, comment: "Best Margherita pizza in town! Simple, thin crust, amazing cheese.", createdAt: "2026-07-18T19:45:00Z" },
];

export let MOCK_CART: CartItem[] = [];

const BASE_MOCK_ORDERS = [
  {
    id: "ord_1",
    userId: "cust_1",
    status: "DELIVERED",
    subtotal: 26.98,
    tax: 1.35,
    delivery: 3.99,
    discount: 5.00,
    total: 27.32,
    paymentStatus: "COMPLETED",
    paymentMethod: "RAZORPAY",
    address: "123 Main St, New York, NY 10001",
    couponCode: "FLAT50",
    createdAt: "2026-07-18T11:30:00.000Z",
    items: [
      {
        id: "ord_item_1",
        orderId: "ord_1",
        menuItemId: "menu_4",
        menuItem: MOCK_MENU[3],
        quantity: 2,
        price: 13.99,
        customization: JSON.stringify({ spiceLevel: "Medium", portionSize: "Regular" }),
      }
    ],
  },
  {
    id: "ord_2",
    userId: "cust_1",
    status: "PREPARING",
    subtotal: 19.98,
    tax: 1.00,
    delivery: 3.99,
    discount: 2.00,
    total: 22.97,
    paymentStatus: "PENDING",
    paymentMethod: "COD",
    address: "123 Main St, New York, NY 10001",
    couponCode: "WELCOME10",
    createdAt: new Date().toISOString(),
    items: [
      {
        id: "ord_item_2",
        orderId: "ord_2",
        menuItemId: "menu_3",
        menuItem: MOCK_MENU[2],
        quantity: 2,
        price: 9.99,
        customization: JSON.stringify({ extraCheese: true }),
      }
    ],
  }
];

export let MOCK_ORDERS: Order[] = BASE_MOCK_ORDERS.map((o) => ({
  ...o,
  createdAt: new Date(o.createdAt),
  updatedAt: new Date(o.createdAt),
  items: o.items.map((item) => ({
    ...item,
    menuItem: {
      ...item.menuItem,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })),
})) as Order[];

// Helper functions to simulate database query response updates in mock mode
export function mockAddToCart(item: Omit<CartItem, "id" | "menuItem">) {
  const existingIndex = MOCK_CART.findIndex(
    (c) => c.userId === item.userId && c.menuItemId === item.menuItemId && c.customization === item.customization
  );
  const menuItem = MOCK_MENU.find((m) => m.id === item.menuItemId) || MOCK_MENU[0];

  if (existingIndex > -1) {
    MOCK_CART[existingIndex].quantity += item.quantity;
  } else {
    MOCK_CART.push({
      id: "cart_" + Math.random().toString(36).substr(2, 9),
      userId: item.userId,
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      customization: item.customization,
      menuItem,
    });
  }
  return MOCK_CART.filter((c) => c.userId === item.userId);
}

export function mockUpdateCart(id: string, quantity: number) {
  const item = MOCK_CART.find((c) => c.id === id);
  if (item) {
    item.quantity = quantity;
  }
  return MOCK_CART;
}

export function mockRemoveFromCart(id: string) {
  MOCK_CART = MOCK_CART.filter((c) => c.id !== id);
  return MOCK_CART;
}

export function mockClearCart(userId: string) {
  MOCK_CART = MOCK_CART.filter((c) => c.userId !== userId);
  return MOCK_CART;
}

export function mockCreateOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt" | "status" | "items"> & { items: { menuItemId: string, quantity: number, price: number, customization: string | null }[] }) {
  const newOrder: Order = {
    id: "ord_" + Math.random().toString(36).substr(2, 9),
    userId: orderData.userId,
    status: "PENDING",
    subtotal: orderData.subtotal,
    tax: orderData.tax,
    delivery: orderData.delivery,
    discount: orderData.discount,
    total: orderData.total,
    paymentStatus: orderData.paymentStatus,
    paymentMethod: orderData.paymentMethod,
    address: orderData.address,
    couponCode: orderData.couponCode,
    createdAt: new Date(),
    updatedAt: new Date(),
    items: orderData.items.map((i, index) => ({
      id: `ord_item_${Date.now()}_${index}`,
      orderId: newOrder.id,
      menuItemId: i.menuItemId,
      menuItem: MOCK_MENU.find((m) => m.id === i.menuItemId) || MOCK_MENU[0],
      quantity: i.quantity,
      price: i.price,
      customization: i.customization,
    })),
  };
  MOCK_ORDERS.unshift(newOrder);
  return newOrder;
}

export function mockUpdateOrderStatus(orderId: string, status: Order["status"], paymentStatus?: Order["paymentStatus"]) {
  const order = MOCK_ORDERS.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
  }
  return order;
}
