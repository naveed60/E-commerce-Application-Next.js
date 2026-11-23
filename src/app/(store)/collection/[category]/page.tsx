import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isProductCategory, LEGACY_CATEGORIES } from "@/lib/product-categories";
import { CollectionClient } from "@/components/landing/collection-client";

export const dynamic = "force-dynamic";

export default async function CollectionPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  if (LEGACY_CATEGORIES[category]) redirect(`/collection/${LEGACY_CATEGORIES[category]}`);
  if (!isProductCategory(category)) notFound();
  const products = await prisma.product.findMany({ where: { category, archived: false }, orderBy: { createdAt: "desc" } });
  return <CollectionClient category={category} products={products.map((p) => ({ id: p.id, name: p.name, description: p.description, price: Number(p.price), image: p.image, tags: p.tags, rating: p.rating, featured: p.featured, category: p.category, inventory: p.inventory, createdAt: p.createdAt.toISOString() }))} />;
}
