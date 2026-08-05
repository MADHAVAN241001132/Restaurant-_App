require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const pg = require('pg');
const bcrypt = require('bcryptjs');

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set in environment variables.");
    process.exit(1);
  }

  console.log("🌱 Starting seed...");

  const pool = new pg.Pool({ connectionString: dbUrl });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // 1. Clean existing data
  console.log("🧹 Cleaning old data...");
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.cuisine.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.coupon.deleteMany({});

  // 2. Create Users
  console.log("👤 Creating users...");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const customerPassword = await bcrypt.hash("customer123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@restaurant.com",
      password: adminPassword,
      phone: "1234567890",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "customer@restaurant.com",
      password: customerPassword,
      phone: "9876543210",
      role: "CUSTOMER",
    },
  });

  console.log(`Created admin: ${admin.email}`);
  console.log(`Created customer: ${customer.email}`);

  // 3. Create Categories
  console.log("🍕 Creating categories...");
  const categories = {};
  const categoryNames = ["Pizza", "Burger", "Desserts", "Beverages", "Main Course", "Starter"];
  const categoryImages = {
    "Pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=60",
    "Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
    "Desserts": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=500&auto=format&fit=crop&q=60",
    "Beverages": "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&auto=format&fit=crop&q=60",
    "Main Course": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&auto=format&fit=crop&q=60",
    "Starter": "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&auto=format&fit=crop&q=60"
  };
  for (const name of categoryNames) {
    const cat = await prisma.category.create({
      data: {
        name,
        image: categoryImages[name] || "/images/categories/default.svg",
        status: "ACTIVE",
      },
    });
    categories[name] = cat;
  }

  // 4. Create Cuisines
  console.log("🍜 Creating cuisines...");
  const cuisines = {};
  const cuisineNames = ["Italian", "American", "Indian", "Chinese", "Mexican"];
  const cuisineImages = {
    "Italian": "https://images.unsplash.com/photo-1498579150354-977475b7ea0b?w=500&auto=format&fit=crop&q=60",
    "American": "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=500&auto=format&fit=crop&q=60",
    "Indian": "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?w=500&auto=format&fit=crop&q=60",
    "Chinese": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60",
    "Mexican": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=500&auto=format&fit=crop&q=60"
  };
  for (const name of cuisineNames) {
    const cuis = await prisma.cuisine.create({
      data: {
        name,
        image: cuisineImages[name] || "/images/menu/default.svg",
        status: "ACTIVE",
      },
    });
    cuisines[name] = cuis;
  }

  // 5. Create Coupons
  console.log("🎟️ Creating coupons...");
  const expiryDate = new Date();
  expiryDate.setMonth(expiryDate.getMonth() + 1);

  await prisma.coupon.create({
    data: {
      code: "WELCOME10",
      discount: 10,
      type: "PERCENTAGE",
      expiry: expiryDate,
      usageLimit: 100,
    },
  });

  await prisma.coupon.create({
    data: {
      code: "FLAT50",
      discount: 50,
      type: "FIXED",
      expiry: expiryDate,
      usageLimit: 50,
    },
  });

  // 6. Create Menu Items
  console.log("🍔 Creating menu items...");
  const menuItemsData = [
    {
      name: "Margherita Pizza",
      description: "Classic Italian pizza with simple fresh ingredients: fresh mozzarella cheese, rich tomato sauce, fragrant basil leaves, and a drizzle of olive oil on a crispy crust.",
      price: 299,
      offerPrice: 249,
      category: "Pizza",
      cuisine: "Italian",
      veg: true,
      featured: true,
      preparationTime: 15,
      rating: 4.8,
    },
    {
      name: "Pepperoni Pizza",
      description: "Generous layers of premium spicy pepperoni slices, melted mozzarella cheese, and rich zesty tomato sauce on our signature thin crust.",
      price: 349,
      offerPrice: null,
      category: "Pizza",
      cuisine: "Italian",
      veg: false,
      featured: false,
      preparationTime: 15,
      rating: 4.6,
    },
    {
      name: "Classic Cheeseburger",
      description: "Juicy, flame-grilled beef patty topped with melted cheddar cheese, fresh lettuce leaves, sliced ripe tomatoes, pickles, onions, and our special burger house sauce on a toasted brioche bun.",
      price: 199,
      offerPrice: 169,
      category: "Burger",
      cuisine: "American",
      veg: false,
      featured: true,
      preparationTime: 12,
      rating: 4.7,
    },
    {
      name: "Paneer Butter Masala",
      description: "Fresh cubes of soft paneer cottage cheese cooked in a rich, velvety, creamy tomato-onion butter gravy flavored with authentic Indian spices.",
      price: 280,
      offerPrice: 240,
      category: "Main Course",
      cuisine: "Indian",
      veg: true,
      featured: true,
      preparationTime: 20,
      rating: 4.9,
    },
    {
      name: "Butter Chicken",
      description: "Tender, tandoori-grilled chicken pieces simmered in a mildly spiced, luxurious butter and cream gravy with aromatic methi leaves.",
      price: 320,
      offerPrice: null,
      category: "Main Course",
      cuisine: "Indian",
      veg: false,
      featured: true,
      preparationTime: 20,
      rating: 4.9,
    },
    {
      name: "Garlic Bread with Cheese",
      description: "Toasted french baguette slices brushed with fresh garlic herb butter and topped with a bubbly layer of melted mozzarella cheese.",
      price: 149,
      offerPrice: null,
      category: "Starter",
      cuisine: "Italian",
      veg: true,
      featured: false,
      preparationTime: 8,
      rating: 4.4,
    },
    {
      name: "Crispy Spring Rolls",
      description: "Delicate and crispy wrappers filled with shredded fresh vegetables and glass noodles, served with a sweet and sour dipping sauce.",
      price: 159,
      offerPrice: 129,
      category: "Starter",
      cuisine: "Chinese",
      veg: true,
      featured: false,
      preparationTime: 10,
      rating: 4.3,
    },
    {
      name: "Loaded Nachos",
      description: "Crispy tortilla chips topped with warm cheese sauce, fresh black beans, guacamole, sour cream, pico de gallo, and sliced jalapeños.",
      price: 189,
      offerPrice: null,
      category: "Starter",
      cuisine: "Mexican",
      veg: true,
      featured: false,
      preparationTime: 10,
      rating: 4.5,
    },
    {
      name: "Chocolate Lava Cake",
      description: "Decadent warm chocolate cake with a molten, gooey chocolate center, dusted with powdered sugar and served with vanilla bean ice cream.",
      price: 149,
      offerPrice: null,
      category: "Desserts",
      cuisine: "American",
      veg: true,
      featured: true,
      preparationTime: 10,
      rating: 4.9,
    },
    {
      name: "Mango Lassi",
      description: "A traditional, refreshing Indian yogurt drink blended with fresh sweet mango pulp, milk, sugar, and a pinch of cardamom.",
      price: 89,
      offerPrice: 69,
      category: "Beverages",
      cuisine: "Indian",
      veg: true,
      featured: false,
      preparationTime: 5,
      rating: 4.8,
    }
  ];

  const menuItemImages = {
    "Margherita Pizza": "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=60",
    "Pepperoni Pizza": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&auto=format&fit=crop&q=60",
    "Classic Cheeseburger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=60",
    "Paneer Butter Masala": "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&auto=format&fit=crop&q=60",
    "Butter Chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500&auto=format&fit=crop&q=60",
    "Garlic Bread with Cheese": "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=500&auto=format&fit=crop&q=60",
    "Crispy Spring Rolls": "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60",
    "Loaded Nachos": "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=500&auto=format&fit=crop&q=60",
    "Chocolate Lava Cake": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=60",
    "Mango Lassi": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=60"
  };

  for (const item of menuItemsData) {
    const category = categories[item.category];
    const cuisine = cuisines[item.cuisine];
    if (category && cuisine) {
      await prisma.menuItem.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          offerPrice: item.offerPrice,
          veg: item.veg,
          featured: item.featured,
          preparationTime: item.preparationTime,
          rating: item.rating,
          categoryId: category.id,
          cuisineId: cuisine.id,
          image: menuItemImages[item.name] || "/images/menu/default.svg",
        },
      });
    }
  }

  // 7. Create some sample reviews
  console.log("✍️ Creating sample reviews...");
  const paneerItem = await prisma.menuItem.findFirst({ where: { name: "Paneer Butter Masala" } });
  const burgerItem = await prisma.menuItem.findFirst({ where: { name: "Classic Cheeseburger" } });

  if (paneerItem && burgerItem) {
    await prisma.review.create({
      data: {
        userId: customer.id,
        menuItemId: paneerItem.id,
        rating: 5,
        comment: "This paneer butter masala is out of this world! So creamy and perfectly spiced.",
      },
    });

    await prisma.review.create({
      data: {
        userId: customer.id,
        menuItemId: burgerItem.id,
        rating: 4,
        comment: "Very solid cheeseburger. Patty was juicy and bun was nice and soft.",
      },
    });
  }

  await pool.end();
  console.log("🌱 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
