import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton. Next.js hot-reloads route modules in dev; without a
 * global cache each reload spins a new PrismaClient and exhausts the SQLite
 * connection limit. The global is reused across HMR + the Next runtime.
 */
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
