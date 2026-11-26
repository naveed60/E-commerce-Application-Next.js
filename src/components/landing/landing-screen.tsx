"use client";

/* Product images can come from the catalog or remote editorial photography. */
/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { Heart, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { formatPrice } from "@/lib/utils";
import type { StorefrontProduct } from "@/types/product";
import styles from "./storefront-design.module.css";
import { PRODUCT_CATEGORY_VALUES, categoryLabel } from "@/lib/product-categories";
import { StorefrontHeader, StorefrontFooter } from "./storefront-shell";

type Props = { products: StorefrontProduct[]; databaseUnavailable?: boolean; initialCategory?: string };

const categoryImages: Record<string, string> = {
  men: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=500&q=85",
  women: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=85",
  kids: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=500&q=85",
  accessories: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=85",
};

export function LandingScreen({ products, databaseUnavailable = false, initialCategory = "" }: Props) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("latest");
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const categories = PRODUCT_CATEGORY_VALUES;
  const visible = useMemo(() => {
    const search = query.trim().toLowerCase();
    const result = products.filter((p) => (!category || p.category === category) && (!search || [p.name, p.description, p.category, ...p.tags].some((v) => v.toLowerCase().includes(search))));
    if (sort === "low") result.sort((a, b) => a.price - b.price);
    if (sort === "high") result.sort((a, b) => b.price - a.price);
    return result;
  }, [products, category, query, sort]);
  return <main className={`${styles.storefront} min-h-screen overflow-x-hidden bg-[#fbfaf8] text-[#101414]`}>
    <StorefrontHeader categories={categories} />
    <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-10 md:grid-cols-[.8fr_1.2fr] md:px-10 md:py-12">
      <div className="order-2 md:order-1"><p className="text-xs font-bold uppercase tracking-[.3em] text-[#d9233f]">New collection</p><h1 className={`${styles.serif} mt-5 max-w-lg text-6xl leading-[.92] md:text-[5.7rem]`}>Everyday<br />Style for<br />Everyone</h1><p className="mt-7 max-w-md text-base leading-7 text-black/70">Trendy, comfortable and high-quality clothes for every occasion.</p><div className="mt-8 flex flex-wrap gap-4"><a href="#shop" className="rounded-full bg-[#06472f] px-7 py-4 text-sm font-bold text-white hover:bg-[#0a633f]">Shop Now</a><a href="#shop" className="rounded-full border border-black/60 px-7 py-4 text-sm font-bold hover:border-[#06472f] hover:text-[#06472f]">View Collection</a></div></div>
      <div className="order-1 overflow-hidden rounded-[40px] md:order-2"><img src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=90" alt="Woman in a burgundy fashion look" className="h-[430px] w-full object-cover md:h-[560px]" /></div>
    </section>
    {categories.length > 0 && <section aria-label="Shop by category" className="mx-auto grid max-w-[1320px] gap-4 px-5 pb-16 sm:grid-cols-2 md:grid-cols-4 md:px-10">{categories.map((item) => {
      const image = categoryImages[item.toLowerCase().split(/[-_ ]/)[0]] || products.find((p) => p.category === item)?.image;
      return <Link key={item} href={`/collection/${encodeURIComponent(item)}`} className="group relative h-32 overflow-hidden rounded-3xl bg-[#52685d] text-left">{image && <><img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" /></>}<span className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" /><span className={`${styles.serif} relative pl-7 text-2xl font-semibold text-white`}>{categoryLabel(item)}</span></Link>;
    })}</section>}
    <section id="shop" className="mx-auto max-w-[1320px] px-5 pb-20 md:px-10"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.3em] text-[#d9233f]">New arrivals</p><h2 className={`${styles.serif} mt-2 text-5xl md:text-6xl`}>Latest Collection</h2></div>
      {databaseUnavailable ? <p role="alert" className="rounded-xl bg-amber-50 p-5 text-sm text-amber-900">Products are temporarily unavailable. Please try again later.</p> : <><div className="mb-7 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center"><label className="flex items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2"><Search size={17} /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products" className="w-full bg-transparent text-sm outline-none" /></label><div className="flex flex-1 flex-wrap gap-2"><button type="button" onClick={() => setCategory("")} aria-pressed={!category} className={`rounded-full px-4 py-2 text-xs font-bold ${!category ? "bg-[#06472f] text-white" : "bg-white text-black/70 ring-1 ring-black/10"}`}>All</button>{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} aria-pressed={category === item} className={`rounded-full px-4 py-2 text-xs font-bold ${category === item ? "bg-[#06472f] text-white" : "bg-white text-black/70 ring-1 ring-black/10"}`}>{categoryLabel(item)}</button>)}</div><label className="sr-only" htmlFor="store-sort">Sort products</label><select id="store-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-full border border-black/15 bg-white px-4 py-2 text-xs font-bold"><option value="latest">Latest</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option></select></div>
      {visible.length ? <div className="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">{visible.map((product) => <article key={product.id} className="group"><div className="relative aspect-[.82] overflow-hidden rounded-xl bg-[#eeeae5]"><Link href={`/products/${encodeURIComponent(product.id)}`} className="block h-full"><img src={product.image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></Link><button type="button" onClick={() => toggleFavorite(product)} aria-pressed={isFavorite(product.id)} aria-label={`${isFavorite(product.id) ? "Remove" : "Add"} ${product.name} ${isFavorite(product.id) ? "from" : "to"} favorites`} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90"><Heart size={19} className={isFavorite(product.id) ? "fill-[#d9233f] text-[#d9233f]" : ""} /></button><button type="button" disabled={(product.inventory ?? 0) <= 0} onClick={() => addItem(product)} aria-label={product.hasVariants ? `Choose options for ${product.name}` : `Add ${product.name} to bag`} className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#06472f] text-white shadow-md hover:bg-[#0a633f] disabled:opacity-50"><Plus size={20} /></button></div><Link href={`/products/${encodeURIComponent(product.id)}`} className="mt-3 block"><h3 className="font-bold">{product.name}</h3><p className="mt-1 font-bold">{formatPrice(product.price)}</p>{product.hasVariants && <p className="mt-1 text-xs font-semibold text-[#06472f]">Choose color / size</p>}{(product.inventory ?? 0) <= 0 && <p className="mt-1 text-xs text-red-700">Out of stock</p>}<p className="mt-1 text-sm text-[#a36c00]" aria-label={`Rating ${product.rating} out of 5`}>★ {product.rating.toFixed(1)}</p></Link></article>)}</div> : <p className="rounded-xl bg-white p-8 text-center text-sm text-black/65">{products.length ? "No products match your search or category." : "No products are available yet."}</p>}</>}
    </section>
    <StorefrontFooter />
  </main>;
}
