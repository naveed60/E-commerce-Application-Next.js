import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, indexingEnabled, productPath } from "@/lib/seo";
import { getValidImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
const SITEMAP_SIZE = 10000;

export async function generateSitemaps() {
  const count = indexingEnabled() ? await prisma.product.count({ where: { archived: false } }) : 0;
  return Array.from({ length: Math.max(1, Math.ceil(count / SITEMAP_SIZE)) }, (_, id) => ({ id }));
}

export default async function sitemap({ id }: { id: Promise<string> }): Promise<MetadataRoute.Sitemap> {
  const value = await id;
  if (!indexingEnabled() || !/^\d{1,6}$/.test(value)) return [];
  const products = await prisma.product.findMany({ where: { archived: false },
    select: { id: true, updatedAt: true, image: true }, orderBy: { id: "asc" }, skip: Number(value) * SITEMAP_SIZE, take: SITEMAP_SIZE });
  return products.map((p) => ({ url: absoluteUrl(productPath(p.id)), lastModified: p.updatedAt,
    ...(getValidImageUrl(p.image) ? { images: [absoluteUrl(p.image)] } : {}),
  }));
}
