import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, indexingEnabled } from "@/lib/seo";
import { isProductCategory } from "@/lib/product-categories";
import { INFO_PAGES } from "@/lib/info-pages";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!indexingEnabled()) return [];
  const categories = await prisma.product.groupBy({ by: ["category"], where: { archived: false } });
  return [
    ...["/", "/shop", "/collections", ...Object.entries(INFO_PAGES).filter(([, page]) => !page.noIndex).map(([slug]) => `/info/${slug}`)]
      .map((path) => ({ url: absoluteUrl(path) })),
    ...categories.filter((c) => isProductCategory(c.category)).map((c) => ({ url: absoluteUrl(`/collection/${c.category}`) })),
  ];
}

