import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const createPrismaClient = (): PrismaClient => {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl) {
    try {
      const pool = new pg.Pool({
        connectionString: dbUrl,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      const adapter = new PrismaPg(pool);
      return new PrismaClient({ adapter });
    } catch (error) {
      console.warn("⚠️ Failed to initialize PrismaPg adapter, falling back to datasourceUrl:", error);
      return new PrismaClient({ datasourceUrl: dbUrl });
    }
  }

  // Fallback for build environment when DATABASE_URL is not present
  return new PrismaClient({
    datasourceUrl: "postgresql://postgres:postgres@localhost:5432/placeholder",
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}


