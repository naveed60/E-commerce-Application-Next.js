"use client";

import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { formatPrice } from "@/lib/utils";
import { type StorefrontProduct } from "@/types/product";
import { ReviewForm } from "./customer-forms";
import { StorefrontShell } from "./storefront-shell";
import styles from "./storefront-design.module.css";

/* Catalog images may be hosted outside Next's configured image domains. */
/* eslint-disable @next/next/no-img-element */
type Product = StorefrontProduct & { inventory: number };
export function ProductDetailClient({ product, related, categoryLabel, validImage, reviews }: { product: Product; related: Product[]; categoryLabel: string; validImage: string | null; reviews: { id: string; rating: number; comment: string; user: { name: string | null } }[] }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const inStock = product.inventory > 0;
  return <StorefrontShell><main className="mx-auto max-w-[1320px] px-5 pb-20 md:px-10">
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 py-7 text-xs text-black/55"><Link href="/">Home</Link><span>/</span>{product.category && <><Link href={`/collection/${encodeURIComponent(product.category)}`}>{categoryLabel}</Link><span>/</span></>}<span className="text-black">{product.name}</span></nav>
    <div className="grid gap-9 md:grid-cols-2 md:gap-16"><div className="overflow-hidden rounded-3xl bg-[#eeeae5]">{validImage ? <img src={validImage} alt={product.name} className="aspect-[.82] w-full object-cover" /> : <div className="grid aspect-[.82] place-items-center text-sm text-black/50">Image unavailable</div>}</div>
      <div className="py-2 md:py-8"><p className="text-xs font-bold uppercase tracking-[.25em] text-[#d9233f]">{categoryLabel || "Collection"}</p><h1 className={`${styles.serif} mt-4 text-5xl leading-tight md:text-6xl`}>{product.name}</h1><p className="mt-5 text-2xl font-bold">{formatPrice(product.price)}</p><p className="mt-3 text-sm text-[#a36c00]" aria-label={`Rating ${product.rating} out of 5`}>★ {product.rating.toFixed(1)} / 5</p><p className="mt-7 leading-7 text-black/65">{product.description}</p><p className={`mt-6 text-sm font-semibold ${inStock ? "text-[#06472f]" : "text-red-700"}`}>{inStock ? "In stock" : "Out of stock"}</p>
        <div className="mt-8 flex flex-wrap gap-3"><button type="button" disabled={!inStock} onClick={() => addItem(product)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#06472f] px-7 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><ShoppingBag size={18} />{inStock ? "Add to bag" : "Out of stock"}</button><button type="button" onClick={() => toggleFavorite(product)} aria-pressed={isFavorite(product.id)} aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"} className="grid h-14 w-14 place-items-center rounded-full border border-black/20"><Heart size={20} className={isFavorite(product.id) ? "fill-[#d9233f] text-[#d9233f]" : ""} /></button></div>
      </div></div>
    <section className="mt-20"><h2 className={`${styles.serif} text-4xl`}>Customer reviews</h2><div className="my-6 space-y-4">{reviews.length ? reviews.map((review) => <article key={review.id} className="rounded-xl bg-white p-5"><p className="text-[#a36c00]">{"★".repeat(review.rating)}</p><p className="mt-2 text-sm">{review.comment}</p><p className="mt-2 text-xs text-black/50">{review.user.name || "Customer"}</p></article>) : <p className="text-sm text-black/60">No published reviews yet.</p>}</div><ReviewForm productId={product.id} /></section>
    {related.length > 0 && <section className="mt-20"><h2 className={`${styles.serif} text-4xl`}>You may also like</h2><div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">{related.map((item) => <Link href={`/products/${encodeURIComponent(item.id)}`} key={item.id} className="group"><div className="aspect-[.82] overflow-hidden rounded-xl bg-[#eeeae5]">{item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover transition group-hover:scale-105" />}</div><p className="mt-3 font-bold">{item.name}</p><p className="mt-1 text-sm">{formatPrice(item.price)}</p>{item.inventory <= 0 && <p className="mt-1 text-xs text-red-700">Out of stock</p>}</Link>)}</div></section>}
  </main></StorefrontShell>;
}
