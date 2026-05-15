import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function logDbConnection() {
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
    console.log(`\x1b[32m✔\x1b[0m  [db] Connected to \x1b[36m${host}:${port}\x1b[0m › \x1b[1m${db}\x1b[0m`);
  } catch {
    console.warn("⚠️  [db] Could not parse DATABASE_URL");
  }
}

if (!global.prisma) {
  logDbConnection();
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
