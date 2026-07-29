import { prisma } from "./prisma";

export async function runDb<T>(
  op: () => Promise<T>,
  fallback: () => T | Promise<T>
): Promise<T> {
  try {
    // Attempt database operation
    return await op();
  } catch (error) {
    console.warn("⚠️ Database query failed (likely connection issue). Falling back to mock data. Error details:", error instanceof Error ? error.message : error);
    return await fallback();
  }
}
