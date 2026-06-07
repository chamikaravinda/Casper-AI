import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = globalThis as unknown as {
  prisma: any;
};

const databaseUrl = process.env.DATABASE_URL || "";

function createPrismaInstance() {
  if (databaseUrl.startsWith("prisma+postgres://")) {
    return new PrismaClient({
      accelerateUrl: databaseUrl,
    }).$extends(withAccelerate());
  } else {
    const pool = new Pool({
      connectionString: databaseUrl,
    });
    const adapter = new PrismaPg(pool);
    return new PrismaClient({
      adapter,
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaInstance();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
