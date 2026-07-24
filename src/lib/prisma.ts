import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function logDbConfiguration() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("⚠️  [db] DATABASE_URL is not set");
    return;
  }
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    const port = parsed.port || "5432";
    const db = parsed.pathname.slice(1);
    console.log(`ℹ️  [db] Configured for \x1b[36m${host}:${port}\x1b[0m › \x1b[1m${db}\x1b[0m`);
  } catch {
    console.warn("⚠️  [db] Could not parse DATABASE_URL");
  }
}

if (!global.prisma) {
  logDbConfiguration();
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
