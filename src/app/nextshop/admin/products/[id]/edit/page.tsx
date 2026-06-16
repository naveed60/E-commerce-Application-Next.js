import { notFound } from "next/navigation";

import { AdminProductForm } from "@/components/admin/admin-product-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]">
          Catalog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
          Edit product
        </h1>
      </div>

      <AdminProductForm
        mode="edit"
        productId={product.id}
        initialData={{
          name: product.name,
          description: product.description,
          price: product.price.toNumber(),
          image: product.image,
          category: product.category ?? "",
          tags: product.tags,
          inventory: product.inventory,
          rating: product.rating,
          featured: product.featured,
        }}
      />
    </div>
  );
}
