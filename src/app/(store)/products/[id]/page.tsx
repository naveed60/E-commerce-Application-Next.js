import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProduct, getProductRating } from "@/lib/catalog";
import { ProductReviews, RelatedProducts } from "@/components/landing/product-detail-sections";
import { ProductDetailClient } from "@/components/landing/product-detail-client";
import { categoryLabel as getCategoryLabel } from "@/lib/product-categories";
import { getValidImageUrl } from "@/lib/utils";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbData, pageMetadata, productPath } from "@/lib/seo";
import { productStructuredData } from "@/lib/product-seo";
import type { SearchParams } from "@/lib/catalog-params";
import { ProductLoading } from "@/components/landing/route-loading";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };

export async function generateMetadata({ params, searchParams }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();
  const { variant: variantId } = await searchParams;
  const variant = product.variants.find((v) => v.id === variantId);
  const color = product.colors.find((c) => c.id === variant?.colorId);
  const description = product.description.replace(/\s+/g, " ").trim() || `Explore ${product.name.trim()} at Drape & Line. View product details, available options and current pricing in PKR.`;
  return pageMetadata({ title: product.name, description: description.length > 160 ? `${description.slice(0, 157)}…` : description,
    path: productPath(id), image: getValidImageUrl(color?.images[0] ?? product.image) });
}

type ProductRecord = NonNullable<Awaited<ReturnType<typeof getProduct>>>;

async function ProductContent({ id, raw, initialVariantId }: {
  id: string;
  raw: ProductRecord;
  initialVariantId?: string;
}) {
  const summary = await getProductRating(id);

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
    ...summary,
    featured: raw.featured as boolean,
    category: (raw.category as string) ?? "",
    inventory: raw.inventory as number,
    createdAt: (raw.createdAt as Date).toISOString(),
  };

  const categoryLabel = getCategoryLabel(product.category);
  const validImage = getValidImageUrl(product.image);

  return (
    <>
    <JsonLd data={productStructuredData(product)} />
    <JsonLd data={breadcrumbData([{ name: "Home", path: "/" }, ...(product.category ? [{ name: categoryLabel, path: `/collection/${encodeURIComponent(product.category)}` }] : []), { name: product.name, path: productPath(id) }])} />
    <ProductDetailClient
      key={`${id}:${initialVariantId ?? "default"}`}
      initialVariantId={initialVariantId}
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
    </>
  );
}

export default async function ProductDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const raw = await getProduct(id);
  if (!raw) notFound();

  const { variant: variantId } = await searchParams;
  const initialVariantId = typeof variantId === "string" && raw.variants.some((v) => v.id === variantId) ? variantId : undefined;

  return <Suspense fallback={<ProductLoading />}>
    <ProductContent id={id} raw={raw} initialVariantId={initialVariantId} />
  </Suspense>;
}
