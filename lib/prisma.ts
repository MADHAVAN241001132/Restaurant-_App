import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

const getPrismaClient = (): PrismaClient => {
  const dbUrl = process.env.DATABASE_URL;

  // In build environments or without valid DB URL, safely fallback
  if (!dbUrl) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
  }

  try {
    const pool = new pg.Pool({
      connectionString: dbUrl,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
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
  } catch (error) {
    console.warn("⚠️ Failed to initialize PrismaPg adapter, falling back to default PrismaClient:", error);
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
  }
};

export const prisma = getPrismaClient();

