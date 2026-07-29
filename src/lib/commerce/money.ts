import { Prisma } from "@prisma/client";

const MONEY_PATTERN = /^(0|[1-9]\d*)(?:\.(\d{1,2}))?$/;

/**
 * Safepay expects amounts in the currency's lowest denomination. This store
 * currently charges PKR, whose exponent is two, so Rs. 1.50 becomes 150.
 */
export function toMinorUnits(value: Prisma.Decimal | number | string): number {
  const normalized = value.toString().trim();
  const match = MONEY_PATTERN.exec(normalized);

  if (!match) {
    throw new Error("A payment amount must be a non-negative value with at most two decimal places.");
  }

  const whole = Number(match[1]);
  const fraction = Number((match[2] ?? "").padEnd(2, "0"));
  const minor = whole * 100 + fraction;

  if (!Number.isSafeInteger(minor) || minor <= 0) {
    throw new Error("The payment amount is outside the supported range.");
  }

  return minor;
}

export function fromMinorUnits(minor: number): Prisma.Decimal {
  if (!Number.isSafeInteger(minor) || minor < 0) {
    throw new Error("Invalid minor-unit amount.");
  }

  return new Prisma.Decimal(minor).dividedBy(100);
}

export function formatMinorPkr(minor: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(minor / 100);
}
