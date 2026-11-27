import { clsx, type ClassValue } from "clsx";
import { isAllowedImageHost } from "./image-hosts";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(amount: number): string {
  return "PKR " + new Intl.NumberFormat("en-PK").format(Math.round(amount));
}

export function formatMinorPkr(amount: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount / 100);
}

export function getValidImageUrl(src: string): string | null {
  if (!src) return null;
  if (src.includes("\\") || /[\u0000-\u001f]/.test(src)) return null;
  if (src.startsWith("/") && !src.startsWith("//")) return src;
  try {
    const url = new URL(src);
    return url.protocol === "https:" && !url.username && !url.password && !url.port && isAllowedImageHost(url.hostname) ? src : null;
  } catch {
    return null;
  }
}
