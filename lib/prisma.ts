import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

// Netlify Database exposes its managed Postgres connection string via NETLIFY_DB_URL.
const getDatabaseUrl = () => process.env.DATABASE_URL || process.env.NETLIFY_DB_URL;

const createPrismaClient = () => {
  const dbUrl = getDatabaseUrl();
  if (!dbUrl) {
    console.warn("⚠️ DATABASE_URL is not set in your environment variables. Database queries will fail.");
  }

  // Create a connection pool using the pg package. The pool connects lazily,
  // so this is safe to construct even without a valid connection string.
  const pool = new pg.Pool({
    connectionString: dbUrl || "postgresql://placeholder:placeholder@localhost:5432/placeholder",
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });

  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
};

const getPrismaClient = () => {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
};

// Constructing PrismaClient eagerly at module scope made Next.js's build-time
// page data collection crash whenever DATABASE_URL was unset, since importing
// this module (e.g. from an API route) triggered client construction. This
// proxy defers construction until the client is actually used at runtime.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrismaClient() as object, prop, receiver);
  },
});
