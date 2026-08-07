require("dotenv/config");
const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "node prisma/seed.js",
  },
  datasource: {
    // Use DIRECT_URL for Prisma CLI migrations/db push to avoid hangs on pooled connection (port 6543)
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/restaurant_db",
  },
});
