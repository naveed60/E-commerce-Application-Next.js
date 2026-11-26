import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductReviews, RelatedProducts } from "@/components/landing/product-detail-sections";
import { ProductDetailClient } from "@/components/landing/product-detail-client";
import { categoryLabel as getCategoryLabel } from "@/lib/product-categories";
import { getValidImageUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const raw = await prisma.product.findUnique({ where: { id, archived: false }, include: { colors: { where: { active: true }, orderBy: { position: "asc" } }, variants: { where: { active: true }, orderBy: { position: "asc" } } } });
  if (!raw) return notFound();

  const product = {
    hasVariants: raw.hasVariants,
    colors: raw.colors,
    variants: raw.variants.map((v) => ({ ...v, price: v.price === null ? null : Number(v.price) })),
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

  const categoryLabel = getCategoryLabel(product.category);
  const validImage = getValidImageUrl(product.image);

  return (
    <ProductDetailClient
      product={product}
      categoryLabel={categoryLabel}
      validImage={validImage}
    >
      <Suspense fallback={<p role="status" className="mt-20 text-sm text-black/60">Loading customer reviews…</p>}>
        <ProductReviews productId={id} />
      </Suspense>
      <Suspense fallback={<p role="status" className="mt-20 text-sm text-black/60">Loading related products…</p>}>
        <RelatedProducts productId={id} category={product.category} />
      </Suspense>
    </ProductDetailClient>
  );
}
