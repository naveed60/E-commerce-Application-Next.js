import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getCatalog, getCatalogTotal } from "@/lib/catalog";
import { CATALOG_PAGE_SIZE, catalogParams, catalogPath, type SearchParams } from "@/lib/catalog-params";
import { CollectionClient } from "@/components/landing/collection-client";
import { CatalogLoading } from "@/components/landing/route-loading";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbData, pageMetadata, SITE_DESCRIPTION } from "@/lib/seo";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<SearchParams> };

async function getShopFilters({ searchParams }: Props) {
  const filters = catalogParams(await searchParams);
  const total = await getCatalogTotal(undefined, filters.q);
  const pages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
  if (filters.page > pages) notFound();
  return { ...filters, total, pages };
}

export async function generateMetadata(props: Props) {
  const data = await getShopFilters(props);
  return pageMetadata({ title: `${data.q ? "Product Search" : "Shop All Clothing & Accessories"}${data.page > 1 ? ` — Page ${data.page}` : ""}`,
    description: SITE_DESCRIPTION, path: catalogPath("/shop", data), noIndex: !!data.q || data.sort !== "latest" || !data.total });
}

async function ShopResults({ catalogPromise, filters }: {
  catalogPromise: ReturnType<typeof getCatalog>;
  filters: ReturnType<typeof catalogParams>;
}) {
  const data = { ...filters, ...await catalogPromise };
  return <><JsonLd data={breadcrumbData([{ name: "Home", path: "/" }, { name: "Shop", path: "/shop" }])} />
    <CollectionClient key={catalogPath("/shop", data)} {...data} title={data.q ? "Search products" : "Shop All"} description={SITE_DESCRIPTION} path="/shop" />
  </>;
}

export default async function ShopPage(props: Props) {
  const filters = catalogParams(await props.searchParams);
  const catalogPromise = getCatalog(undefined, filters.page, filters.q, filters.sort);
  await getShopFilters(props);
  return <Suspense fallback={<CatalogLoading title="the shop" />}>
    <ShopResults catalogPromise={catalogPromise} filters={filters} />
  </Suspense>;
}
