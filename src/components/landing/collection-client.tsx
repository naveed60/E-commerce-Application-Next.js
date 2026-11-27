import Link from "next/link";
import { Search } from "lucide-react";
import type { StorefrontProduct } from "@/types/product";
import { CATALOG_PAGE_SIZE, catalogPath } from "@/lib/catalog-params";
import { PRODUCT_CATEGORY_VALUES, categoryLabel } from "@/lib/product-categories";
import { StorefrontShell } from "./storefront-shell";
import { CatalogCard } from "./catalog-card";
import styles from "./storefront-design.module.css";

type Props = {
  title: string; description: string; path: string; products: StorefrontProduct[];
  total: number; page: number; pages: number; q: string; sort: string;
};

export function CollectionClient({ title, description, path, products, total, page, pages, q, sort }: Props) {
  const link = (nextPage: number) => catalogPath(path, { page: nextPage, q, sort });
  const pageNumbers = Array.from(new Set([1, page - 1, page, page + 1, pages])).filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  return <StorefrontShell><main className="mx-auto min-h-[60vh] max-w-[1320px] px-5 py-12 md:px-10">
    <nav aria-label="Breadcrumb" className="mb-6 text-xs text-black/55"><Link href="/">Home</Link><span aria-hidden="true"> / </span><span aria-current="page">{title}</span></nav>
    <p className="text-xs font-bold uppercase tracking-[.3em] text-[#d9233f]">Our collection</p>
    <h1 className={`${styles.serif} mt-3 text-5xl md:text-6xl`}>{title}</h1>
    <p className="mt-4 max-w-3xl leading-7 text-black/65">{description}</p>
    <p className="mt-3 text-sm text-black/60">{total ? `${(page - 1) * CATALOG_PAGE_SIZE + 1}–${Math.min(page * CATALOG_PAGE_SIZE, total)} of ` : ""}{total} product{total === 1 ? "" : "s"}{q ? ` matching “${q}”` : ""}</p>
    <form action={path} method="get" role="search" className="my-8 flex flex-wrap gap-3">
      <label className="flex w-full min-w-0 items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2 sm:w-auto sm:flex-1"><Search size={17} /><span className="sr-only">Search products</span><input name="q" defaultValue={q} maxLength={100} placeholder="Search products" className="min-w-0 w-full bg-transparent text-sm outline-none" /></label>
      <label className="sr-only" htmlFor="collection-sort">Sort products</label><select id="collection-sort" name="sort" defaultValue={sort} className="flex-1 rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold sm:flex-none"><option value="latest">Latest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select>
      <button className="rounded-full bg-[#06472f] px-6 py-2 text-sm font-bold text-white">Apply</button>
      {(q || sort !== "latest") && <Link href={path} className="px-3 py-2 text-sm underline">Clear filters</Link>}
    </form>
    {products.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{products.map((product) => <CatalogCard key={product.id} product={product} />)}</div> : <p className="rounded-xl bg-white p-8 text-center text-sm">{q ? "No products match your search." : "No products in this collection yet."}</p>}
    {pages > 1 && <nav aria-label="Product pagination" className="mt-10 flex flex-wrap items-center justify-center gap-3">
      {page > 1 && <Link prefetch={false} href={link(page - 1)} className="rounded-full border border-black/15 px-4 py-2">Previous</Link>}
      {pageNumbers.map((number, index) => <span key={number} className="flex items-center gap-3">{index > 0 && number > pageNumbers[index - 1] + 1 && <span aria-hidden="true">…</span>}{number === page ? <span aria-current="page" aria-label={`Page ${number}`} className="rounded-full bg-[#06472f] px-4 py-2 text-white">{number}</span> : <Link prefetch={false} href={link(number)} aria-label={`Page ${number}`} className="rounded-full border border-black/15 px-4 py-2">{number}</Link>}</span>)}
      {page < pages && <Link prefetch={false} href={link(page + 1)} className="rounded-full border border-black/15 px-4 py-2">Next</Link>}
    </nav>}
    <aside className="mt-14 border-t border-black/10 pt-8"><h2 className={`${styles.serif} text-3xl`}>Explore our collections</h2><div className="mt-4 flex flex-wrap gap-4">{PRODUCT_CATEGORY_VALUES.map((category) => <Link key={category} href={`/collection/${category}`} className="text-sm font-semibold text-[#06472f] underline">{categoryLabel(category)}</Link>)}</div><p className="mt-5 text-sm text-black/65">Check each product for available sizes and colours. Visit our <Link href="/info/shipping-delivery" className="underline">delivery information</Link> and <Link href="/info/returns-exchanges" className="underline">returns policy</Link> before ordering.</p></aside>
  </main></StorefrontShell>;
}
