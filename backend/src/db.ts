import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const globalForDb = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: pg.Pool;
};

const pool =
  globalForDb.pgPool ??
  new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
  });

const prisma =
  globalForDb.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pgPool = pool;
  globalForDb.prisma = prisma;
}

export { prisma };
