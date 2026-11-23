"use client";

import Link from "next/link";
import { Heart, Trash2, X } from "lucide-react";
import { useFavorites } from "@/components/providers/favorites-provider";
import { formatPrice } from "@/lib/utils";
import styles from "@/components/landing/storefront-design.module.css";

/* Catalog images may be hosted outside Next's configured image domains. */
/* eslint-disable @next/next/no-img-element */
export function FavoritesDrawer() {
  const { favorites, isOpen, closeDrawer, removeFavorite } = useFavorites();
  if (!isOpen) return null;
  return <div className={`${styles.storefront} fixed inset-0 z-50 bg-black/50`} onClick={closeDrawer}><aside role="dialog" aria-modal="true" aria-labelledby="favorites-title" onClick={(event) => event.stopPropagation()} className="ml-auto flex h-full w-full max-w-lg flex-col bg-[#fbfaf8] p-6 text-[#101414] shadow-2xl md:p-10"><div className="mb-8 flex items-center justify-between"><h2 id="favorites-title" className={`${styles.serif} text-4xl`}>Your favorites</h2><button type="button" onClick={closeDrawer} aria-label="Close favorites"><X size={22} /></button></div>{favorites.length ? <div className="flex-1 space-y-5 overflow-y-auto">{favorites.map((item) => <div key={item.id} className="flex gap-4 border-b border-black/10 pb-5"><Link href={`/products/${encodeURIComponent(item.id)}`} onClick={closeDrawer} className="shrink-0"><img src={item.image} alt={item.name} className="h-28 w-24 rounded object-cover" /></Link><div className="flex min-w-0 flex-1 flex-col items-start"><Link href={`/products/${encodeURIComponent(item.id)}`} onClick={closeDrawer} className="font-bold">{item.name}</Link><p className="mt-2 text-sm">{formatPrice(item.price)}</p><button type="button" onClick={() => removeFavorite(item.id)} className="mt-auto flex items-center gap-2 text-sm text-black/60 hover:text-red-700" aria-label={`Remove ${item.name} from favorites`}><Trash2 size={16} /> Remove</button></div></div>)}</div> : <div className="flex flex-1 flex-col items-center justify-center text-center"><Heart size={30} className="mb-5 text-black/30" /><p className={`${styles.serif} text-4xl`}>No favorites yet.</p><Link href="/#shop" onClick={closeDrawer} className="mt-7 rounded-full bg-[#06472f] px-6 py-3 text-sm font-bold text-white">Explore products</Link></div>}</aside></div>;
}
