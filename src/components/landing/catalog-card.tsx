"use client";

import Link from "next/link";
import { Heart, Plus } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { formatPrice } from "@/lib/utils";
import type { StorefrontProduct } from "@/types/product";
import { CatalogImage } from "./catalog-image";

export function CatalogCard({ product, heading = "h2" }: { product: StorefrontProduct; heading?: "h2" | "h3" }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const Heading = heading;
  const href = `/products/${encodeURIComponent(product.id)}`;
  return <article className="group">
    <div className="relative aspect-[.82] overflow-hidden rounded-xl bg-[#eeeae5]">
      <Link href={href} className="absolute inset-0"><CatalogImage src={product.image} alt={product.name} className="object-cover transition duration-500 group-hover:scale-105" /></Link>
      <button type="button" onClick={() => toggleFavorite(product)} aria-pressed={isFavorite(product.id)} aria-label={`${isFavorite(product.id) ? "Remove" : "Add"} ${product.name} ${isFavorite(product.id) ? "from" : "to"} favorites`} className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90"><Heart size={19} className={isFavorite(product.id) ? "fill-[#d9233f] text-[#d9233f]" : ""} /></button>
      <button type="button" disabled={(product.inventory ?? 0) <= 0} onClick={() => addItem(product)} aria-label={product.hasVariants ? `Choose options for ${product.name}` : `Add ${product.name} to bag`} className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-[#06472f] text-white shadow-md disabled:opacity-50"><Plus size={20} /></button>
    </div>
    <Link href={href} className="mt-3 block"><Heading className="font-bold">{product.name}</Heading></Link>
    <p className="mt-1 font-bold">{product.hasVariants ? "From " : ""}{formatPrice(product.price)}</p>
    {product.hasVariants && <p className="mt-1 text-xs font-semibold text-[#06472f]">Choose color / size</p>}
    {(product.inventory ?? 0) <= 0 && <p className="mt-1 text-xs text-red-700">Out of stock</p>}
    {!!product.reviewCount && <p className="mt-1 text-sm text-[#a36c00]" aria-label={`Rating ${product.rating.toFixed(1)} out of 5 from ${product.reviewCount} reviews`}>★ {product.rating.toFixed(1)} ({product.reviewCount})</p>}
  </article>;
}
