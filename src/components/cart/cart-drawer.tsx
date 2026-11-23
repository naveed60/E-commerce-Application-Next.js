"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { formatPrice } from "@/lib/utils";
import styles from "@/components/landing/storefront-design.module.css";

/* Catalog images may be hosted outside Next's configured image domains. */
/* eslint-disable @next/next/no-img-element */
export function CartDrawer() {
  const { items, total, isOpen, removeItem, setQuantity, closeCart } = useCart();
  if (!isOpen) return null;
  return <div className={`${styles.storefront} fixed inset-0 z-50 bg-black/50`} onClick={closeCart}><aside role="dialog" aria-modal="true" aria-labelledby="cart-title" onClick={(event) => event.stopPropagation()} className="ml-auto flex h-full w-full max-w-lg flex-col bg-[#fbfaf8] p-6 text-[#101414] shadow-2xl md:p-10"><div className="mb-8 flex items-center justify-between"><h2 id="cart-title" className={`${styles.serif} text-4xl`}>Your bag</h2><button type="button" onClick={closeCart} aria-label="Close bag"><X size={22} /></button></div>
    {items.length ? <><div className="flex-1 space-y-5 overflow-y-auto">{items.map((item) => <div key={item.id} className="flex gap-4 border-b border-black/10 pb-5"><Link href={`/products/${encodeURIComponent(item.id)}`} onClick={closeCart} className="shrink-0"><img src={item.image} alt={item.name} className="h-28 w-24 rounded object-cover" /></Link><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><Link href={`/products/${encodeURIComponent(item.id)}`} onClick={closeCart} className="font-bold">{item.name}</Link><p className="font-bold">{formatPrice(item.price * item.quantity)}</p></div><div className="mt-5 flex items-center gap-3"><button type="button" onClick={() => setQuantity(item.id, item.quantity - 1)} aria-label={`Decrease quantity of ${item.name}`} className="rounded-full border border-black/20 p-1"><Minus size={17} /></button><span aria-label={`Quantity ${item.quantity}`}>{item.quantity}</span><button type="button" onClick={() => setQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= 10} aria-label={`Increase quantity of ${item.name}`} className="rounded-full border border-black/20 p-1 disabled:opacity-40"><Plus size={17} /></button><button type="button" onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name} from bag`} className="ml-auto p-2 text-black/50 hover:text-red-700"><Trash2 size={18} /></button></div></div></div>)}</div><div className="border-t border-black/10 pt-5"><div className="flex justify-between text-lg font-bold"><span>Total</span><span>{formatPrice(total)}</span></div><Link href="/checkout" onClick={closeCart} className="mt-6 block w-full rounded-full bg-[#06472f] px-6 py-4 text-center text-sm font-bold text-white">Proceed to checkout</Link></div></> : <div className="flex flex-1 flex-col items-center justify-center text-center"><p className={`${styles.serif} text-4xl`}>Your bag is empty.</p><Link href="/#shop" onClick={closeCart} className="mt-7 rounded-full bg-[#06472f] px-6 py-3 text-sm font-bold text-white">Continue shopping</Link></div>}
  </aside></div>;
}
