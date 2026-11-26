import { createHash, randomBytes } from "node:crypto";
import type { Prisma } from "@prisma/client";

export const GUEST_CHECKOUT_COOKIE = "store_guest_checkout";
export const GUEST_CHECKOUT_MAX_AGE = 60 * 60 * 24 * 30;

export type OrderAccess = { userId: string | null; guestAccessHash: string | null };

export function createGuestToken(): string {
  return randomBytes(32).toString("hex");
}

export function guestTokenHash(token: string | undefined): string | null {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return createHash("sha256").update(token).digest("hex");
}

// No identity must match no orders, rather than accidentally matching all
// guest orders through a null userId. Never authorize by an email or order id.
export function orderAccessWhere(access: OrderAccess): Prisma.OrderWhereInput {
  const owners: Prisma.OrderWhereInput[] = [];
  if (access.userId) owners.push({ userId: access.userId });
  if (access.guestAccessHash) owners.push({ userId: null, guestAccessHash: access.guestAccessHash });
  return { OR: owners };
}
