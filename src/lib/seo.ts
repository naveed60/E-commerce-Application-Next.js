import type { Metadata } from "next";

export const SITE_NAME = "Drape & Line";
export const SITE_DESCRIPTION = "Shop clothing for men, women and kids, plus everyday accessories at Drape & Line. Explore the latest collections with prices in PKR.";

export function getSiteUrl(): URL {
  const configured = process.env.SITE_URL?.trim() || "https://my-store-next-js.vercel.app";
  const url = new URL(configured);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    throw new Error("SITE_URL must be an absolute HTTP(S) URL without credentials.");
  }
  // All storefront routes are hosted at the origin, not below a URL prefix.
  return new URL(url.origin);
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString();
}

export function indexingEnabled(): boolean {
  const host = getSiteUrl().hostname;
  const local = host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host.endsWith(".localhost");
  return !local && process.env.NODE_ENV === "production" &&
    process.env.VERCEL_ENV !== "preview" && process.env.VERCEL_ENV !== "development" &&
    process.env.INDEXING_ENABLED !== "false";
}

export const PRIVATE_ROBOTS: Metadata["robots"] = { index: false, follow: false };

export function pageMetadata({ title, description, path, image, noIndex = false }: {
  title: string; description: string; path: string; image?: string | null; noIndex?: boolean;
}): Metadata {
  const images = [{ url: absoluteUrl(image || "/social-image"), alt: title }];
  const socialTitle = `${title} | ${SITE_NAME}`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index: indexingEnabled() && !noIndex, follow: true },
    openGraph: { title: socialTitle, description, url: absoluteUrl(path), siteName: SITE_NAME, locale: "en_PK", type: "website", images },
    twitter: { card: "summary_large_image", title: socialTitle, description, images },
  };
}

export function productPath(id: string, variantId?: string): string {
  const path = `/products/${encodeURIComponent(id)}`;
  return variantId ? `${path}?variant=${encodeURIComponent(variantId)}` : path;
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function breadcrumbData(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}
