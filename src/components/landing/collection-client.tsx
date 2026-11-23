"use client";

import Link from "next/link";
import { Heart, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { formatPrice } from "@/lib/utils";
import type { StorefrontProduct } from "@/types/product";
import { StorefrontShell } from "./storefront-shell";
import styles from "./storefront-design.module.css";
import { categoryLabel } from "@/lib/product-categories";

/* Catalog images may be hosted outside Next's configured image domains. */
/* eslint-disable @next/next/no-img-element */
export function CollectionClient({ category, products }: { category: string; products: StorefrontProduct[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("latest");
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = products.filter((p) => [p.name, p.description, ...p.tags].some((value) => value.toLowerCase().includes(q)));
    if (sort === "low") filtered.sort((a, b) => a.price - b.price);
    if (sort === "high") filtered.sort((a, b) => b.price - a.price);
    return filtered;
  }, [products, query, sort]);
  const label = categoryLabel(category);
  return <StorefrontShell><main className="mx-auto min-h-[60vh] max-w-[1320px] px-5 py-12 md:px-10"><p className="text-xs font-bold uppercase tracking-[.3em] text-[#d9233f]">Our collection</p><h1 className={`${styles.serif} mt-3 text-5xl md:text-6xl`}>{label}</h1><p className="mt-3 text-sm text-black/60">{visible.length} product{visible.length === 1 ? "" : "s"}</p><div className="my-8 flex flex-wrap gap-3"><label className="flex flex-1 items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2"><Search size={17} /><span className="sr-only">Search collection</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search collection" className="w-full bg-transparent text-sm outline-none" /></label><label className="sr-only" htmlFor="collection-sort">Sort products</label><select id="collection-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold"><option value="latest">Latest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
    {visible.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{visible.map((product) => <article key={product.id}><div className="relative aspect-[.82] overflow-hidden rounded-xl bg-[#eeeae5]"><Link href={`/products/${encodeURIComponent(product.id)}`} className="block h-full"><img src={product.image} alt={product.name} className="h-full w-full object-cover" /></Link><button type="button" onClick={() => toggleFavorite(product)} aria-pressed={isFavorite(product.id)} aria-label={`${isFavorite(product.id) ? "Remove" : "Add"} ${product.name} ${isFavorite(product.id) ? "from" : "to"} favorites`} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90"><Heart size={19} className={isFavorite(product.id) ? "fill-[#d9233f] text-[#d9233f]" : ""} /></button><button type="button" disabled={(product.inventory ?? 0) <= 0} onClick={() => addItem(product)} aria-label={`Add ${product.name} to bag`} className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#06472f] text-white disabled:opacity-50"><Plus size={20} /></button></div><Link href={`/products/${encodeURIComponent(product.id)}`}><h2 className="mt-3 font-bold">{product.name}</h2><p className="mt-1 font-bold">{formatPrice(product.price)}</p>{(product.inventory ?? 0) <= 0 && <p className="mt-1 text-xs text-red-700">Out of stock</p>}</Link></article>)}</div> : <p className="rounded-xl bg-white p-8 text-center text-sm">{query ? "No products match your search." : "No products in this collection yet."}</p>}
  </main></StorefrontShell>;
}
