import { Suspense } from "react";
import { notFound, permanentRedirect } from "next/navigation";
import { getCatalog, getCatalogTotal } from "@/lib/catalog";
import { isProductCategory, LEGACY_CATEGORIES, CATEGORY_CONTENT } from "@/lib/product-categories";
import { CATALOG_PAGE_SIZE, catalogParams, catalogPath, type SearchParams } from "@/lib/catalog-params";
import { CollectionClient } from "@/components/landing/collection-client";
import { CatalogLoading } from "@/components/landing/route-loading";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbData, pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ category: string }>; searchParams: Promise<SearchParams> };

async function getCollectionFilters({ params, searchParams }: Props) {
  const { category } = await params;
  if (Object.hasOwn(LEGACY_CATEGORIES, category)) permanentRedirect(`/collection/${LEGACY_CATEGORIES[category]}`);
  if (!isProductCategory(category)) notFound();
  const filters = catalogParams(await searchParams);
  const total = await getCatalogTotal(category, filters.q);
  const pages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  if (filters.page > pages) notFound();
  return { category, ...filters, total, pages };
}

export async function generateMetadata(props: Props) {
  const data = await getCollectionFilters(props);
  const content = CATEGORY_CONTENT[data.category];
  return pageMetadata({ title: `${content.title}${data.page > 1 ? ` — Page ${data.page}` : ""}`,
    description: content.description, path: catalogPath(`/collection/${data.category}`, data),
    noIndex: !!data.q || data.sort !== "latest" || data.total === 0 });
}

async function CollectionResults({ category, catalogPromise, filters }: {
  category: keyof typeof CATEGORY_CONTENT;
  catalogPromise: ReturnType<typeof getCatalog>;
  filters: ReturnType<typeof catalogParams>;
}) {
  const data = { category, ...filters, ...await catalogPromise };
  const content = CATEGORY_CONTENT[category];
  return <><JsonLd data={breadcrumbData([{ name: "Home", path: "/" }, { name: content.title, path: `/collection/${category}` }])} />
    <CollectionClient key={catalogPath(`/collection/${category}`, data)} {...data} {...content} path={`/collection/${category}`} />
  </>;
}

export default async function CollectionPage(props: Props) {
  const { category } = await props.params;
  if (Object.hasOwn(LEGACY_CATEGORIES, category)) permanentRedirect(`/collection/${LEGACY_CATEGORIES[category]}`);
  if (!isProductCategory(category)) notFound();
  const filters = catalogParams(await props.searchParams);
  const catalogPromise = getCatalog(category, filters.page, filters.q, filters.sort);
  await getCollectionFilters(props);
  return <Suspense fallback={<CatalogLoading title={CATEGORY_CONTENT[category].title} />}>
    <CollectionResults category={category} catalogPromise={catalogPromise} filters={filters} />
  </Suspense>;
}
