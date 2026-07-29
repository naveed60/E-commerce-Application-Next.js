import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

const allowedImageHosts = new Set([
  "images.unsplash.com",
  "www.bopuqilamur.org.uk",
  "img.freepik.com",
]);

const allowedImageHostSuffixes = [".public.blob.vercel-storage.com"];

function isAllowedImageHost(hostname: string): boolean {
  if (allowedImageHosts.has(hostname)) {
    return true;
  }

  return allowedImageHostSuffixes.some(
    (suffix) =>
      hostname === suffix.slice(1) || hostname.endsWith(suffix),
  );
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
  if (src.startsWith("/")) return src;
  try {
    const url = new URL(src);
    return isAllowedImageHost(url.hostname) ? src : null;
  } catch {
    return null;
  }
}
