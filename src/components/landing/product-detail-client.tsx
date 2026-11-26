"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Heart, ShoppingBag } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { formatPrice, getValidImageUrl } from "@/lib/utils";
import { type StorefrontProduct } from "@/types/product";
import { StorefrontShell } from "./storefront-shell";
import styles from "./storefront-design.module.css";

/* Catalog images may be hosted outside Next's configured image domains. */
/* eslint-disable @next/next/no-img-element */
type Product = StorefrontProduct & { inventory: number };
export function ProductDetailClient({ product, categoryLabel, validImage, children }: { product: Product; categoryLabel: string; validImage: string | null; children: ReactNode }) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const variants = (product.variants ?? []).filter((v) => v.active);
  const colors = (product.colors ?? []).filter((c) => variants.some((v) => v.colorId === c.id));
  const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
  const [colorId, setColorId] = useState<string | null>(null);
  const [size, setSize] = useState("");
  const [photoIndex, setPhotoIndex] = useState(0);
  const selectedColor = colors.find((c) => c.id === colorId);
  const selectedVariant = variants.find((v) => v.colorId === colorId && v.size === size);
  const needsChoice = !!product.hasVariants && !selectedVariant;
  const inventory = product.hasVariants ? selectedVariant?.inventory ?? 0 : product.inventory;
  const inStock = !needsChoice && inventory > 0;
  const price = selectedVariant?.price ?? product.price;
  const photos = selectedColor?.images.length ? selectedColor.images : validImage ? [validImage] : [];
  const currentPhoto = getValidImageUrl(photos[photoIndex] ?? photos[0] ?? "");
  const optionClass = (selected: boolean) => `rounded-full border px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${selected ? "border-[#06472f] bg-[#06472f] text-white" : "border-black/20 bg-white"}`;

  return <StorefrontShell><main className="mx-auto max-w-[1320px] px-5 pb-20 md:px-10">
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 py-7 text-xs text-black/55"><Link href="/">Home</Link><span>/</span>{product.category && <><Link href={`/collection/${encodeURIComponent(product.category)}`}>{categoryLabel}</Link><span>/</span></>}<span className="text-black">{product.name}</span></nav>
    <div className="grid gap-9 md:grid-cols-2 md:gap-16">
      <div><div className="overflow-hidden rounded-3xl bg-[#eeeae5]">{currentPhoto ? <img src={currentPhoto} alt={[product.name, selectedColor?.name].filter(Boolean).join(" — ")} className="aspect-[.82] w-full object-cover" /> : <div className="grid aspect-[.82] place-items-center text-sm text-black/50">Image unavailable</div>}</div>
        {photos.length > 1 && <div className="mt-3 flex gap-3 overflow-x-auto">{photos.map((url, index) => <button key={`${url}-${index}`} type="button" aria-label={`View photo ${index + 1}`} aria-pressed={photoIndex === index} onClick={() => setPhotoIndex(index)} className={`shrink-0 overflow-hidden rounded-xl border-2 ${photoIndex === index ? "border-[#06472f]" : "border-transparent"}`}><img src={url} alt="" className="h-20 w-16 object-cover" /></button>)}</div>}
      </div>
      <div className="py-2 md:py-8"><p className="text-xs font-bold uppercase tracking-[.25em] text-[#d9233f]">{categoryLabel || "Collection"}</p><h1 className={`${styles.serif} mt-4 text-5xl leading-tight md:text-6xl`}>{product.name}</h1><p className="mt-5 text-2xl font-bold" aria-live="polite">{formatPrice(price)}</p><p className="mt-3 text-sm text-[#a36c00]" aria-label={`Rating ${product.rating} out of 5`}>★ {product.rating.toFixed(1)} / 5</p><p className="mt-7 leading-7 text-black/65">{product.description}</p>
        {product.hasVariants && <div className="mt-7 space-y-5">
          {colors.length > 0 && <fieldset><legend className="mb-3 text-sm font-bold">Color{selectedColor ? `: ${selectedColor.name}` : ": Select a color"}</legend><div className="flex flex-wrap gap-2">{colors.map((c) => <button type="button" key={c.id} aria-pressed={colorId === c.id} className={optionClass(colorId === c.id)} onClick={() => { setColorId(c.id); setPhotoIndex(0); if (size && !variants.some((v) => v.colorId === c.id && v.size === size && v.inventory > 0)) setSize(""); }}><span className="mr-2 inline-block h-3 w-3 rounded-full border border-black/20" style={{ backgroundColor: c.swatch }} />{c.name}{!variants.some((v) => v.colorId === c.id && v.inventory > 0) ? " (sold out)" : ""}</button>)}</div></fieldset>}
          {sizes.length > 0 && <fieldset><legend className="mb-3 text-sm font-bold">Size{size ? `: ${size}` : ": Select a size"}</legend><div className="flex flex-wrap gap-2">{sizes.map((s) => {
            const available = variants.some((v) => v.size === s && (colors.length === 0 || colorId === null || v.colorId === colorId) && v.inventory > 0);
            return <button type="button" key={s} aria-pressed={size === s} disabled={!available} className={optionClass(size === s)} onClick={() => setSize(s)}>{s}{!available ? " (unavailable)" : ""}</button>;
          })}</div></fieldset>}
          {selectedVariant && <p className="text-xs text-black/55">SKU: {selectedVariant.sku}</p>}
        </div>}
        <p aria-live="polite" className={`mt-6 text-sm font-semibold ${needsChoice || inStock ? "text-[#06472f]" : "text-red-700"}`}>{needsChoice ? "Choose your options to check availability." : inStock ? `${inventory} in stock` : "Out of stock"}</p>
        <div className="mt-8 flex flex-wrap gap-3"><button type="button" disabled={!inStock} onClick={() => addItem(product, selectedVariant ? { id: selectedVariant.id, color: selectedColor?.name, size: selectedVariant.size, sku: selectedVariant.sku, price, inventory, image: photos[0] ?? product.image } : undefined)} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#06472f] px-7 py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"><ShoppingBag size={18} />{needsChoice ? "Select options" : inStock ? "Add to bag" : "Out of stock"}</button><button type="button" onClick={() => toggleFavorite(product)} aria-pressed={isFavorite(product.id)} aria-label={isFavorite(product.id) ? "Remove from favorites" : "Add to favorites"} className="grid h-14 w-14 place-items-center rounded-full border border-black/20"><Heart size={20} className={isFavorite(product.id) ? "fill-[#d9233f] text-[#d9233f]" : ""} /></button></div>
      </div>
    </div>{children}
  </main></StorefrontShell>;
}
