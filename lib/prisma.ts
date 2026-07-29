import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const getPrismaClient = () => {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.warn("⚠️ DATABASE_URL is not set in your environment variables. Database queries will fail.");
    return new PrismaClient(); // Fallback to avoid compile error, though queries will fail.
  }

  // Create a connection pool using the pg package
  const pool = new pg.Pool({
    connectionString: dbUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  const adapter = new PrismaPg(pool);

  if (process.env.NODE_ENV === "production") {
    return new PrismaClient({ adapter });
  } else {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    return globalForPrisma.prisma;
  }
};

export const prisma = getPrismaClient();
