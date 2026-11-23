import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await (prisma.product.findUnique as any)({ where: { id, archived: false } });
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
    where: { category: product.category, archived: false, NOT: { id: product.id } },
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

  const reviews = await prisma.productReview.findMany({ where: { productId: product.id, visible: true }, orderBy: { createdAt: "desc" }, select: { id: true, rating: true, comment: true, user: { select: { name: true } } } });

  const categoryLabel = getCategoryLabel(product.category);
  const validImage = getValidImageUrl(product.image);

  return (
    <ProductDetailClient
      product={product}
      related={related}
      categoryLabel={categoryLabel}
      validImage={validImage}
      reviews={reviews}
    />
  );
}
