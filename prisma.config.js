require("dotenv/config");
const { defineConfig } = require("prisma/config");

module.exports = defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Use process.env directly so Prisma doesn't attempt to resolve env
    // variables via the helper at install time on platforms like Vercel.
    url: process.env.DATABASE_URL ?? undefined,
  },
});
