import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetailClient } from "@/components/landing/product-detail-client";
import { getValidImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

const CATEGORY_LABELS: Record<string, string> = {
  "men-un-stitch":   "Men — Un-Stitch",
  "men-stitch":      "Men — Stitch",
  "men-watches":     "Men — Watches",
  "men-perfumes":    "Men — Perfumes",
  "men-cufflinks":   "Men — Cufflinks",
  "women-un-stitch": "Women — Un-Stitch",
  "women-stitch":    "Women — Stitch",
  "women-watches":   "Women — Watches",
  "women-perfumes":  "Women — Perfumes",
  "women-cufflinks": "Women — Cufflinks",
  "kids-baby-boys":  "Kids — Baby Boys Suits",
  "kids-baby-girls": "Kids — Baby Girls Suits",
};

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (prisma.product.findUnique as any)({ where: { id } });
  if (!raw) return notFound();

  const product = {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    price: Number(raw.price),
    image: raw.image,
    tags: raw.tags as string[],
    rating: raw.rating as number,
    featured: raw.featured as boolean,
    category: (raw.category as string) ?? "",
    inventory: raw.inventory as number,
    createdAt: (raw.createdAt as Date).toISOString(),
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const relatedRaw = await (prisma.product.findMany as any)({
    where: { category: product.category, NOT: { id: product.id } },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const related = relatedRaw.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    image: p.image,
    tags: p.tags as string[],
    rating: p.rating as number,
    featured: p.featured as boolean,
    category: (p.category as string) ?? "",
    inventory: p.inventory as number,
    createdAt: (p.createdAt as Date).toISOString(),
  }));

  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;
  const validImage = getValidImageUrl(product.image);

  return (
    <ProductDetailClient
      product={product}
      related={related}
      categoryLabel={categoryLabel}
      validImage={validImage}
    />
  );
}
