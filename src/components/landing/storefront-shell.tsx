"use client";

import Link from "next/link";
import { Heart, Menu, ShoppingBag, UserRound, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import styles from "./storefront-design.module.css";
import { PRODUCT_CATEGORY_VALUES, categoryLabel } from "@/lib/product-categories";

const links = [
  { title: "Shop", items: [{ name: "All Products", href: "/#shop" }, ...PRODUCT_CATEGORY_VALUES.map((value) => ({ name: categoryLabel(value), href: `/collection/${value}` })), { name: "Your Account", href: "/login" }] },
  { title: "Help", items: [{ name: "Track Order", href: "/info/track-order" }, { name: "Returns & Exchanges", href: "/info/returns-exchanges" }, { name: "FAQs", href: "/info/faqs" }, { name: "Contact Us", href: "/info/contact-us" }] },
  { title: "About", items: [{ name: "Our Story", href: "/info/our-story" }, { name: "Sustainability", href: "/info/sustainability" }, { name: "Privacy Policy", href: "/info/privacy-policy" }, { name: "Terms & Conditions", href: "/info/terms-conditions" }] },
];

export function StorefrontHeader({ categories = PRODUCT_CATEGORY_VALUES }: { categories?: readonly string[] }) {
  const { itemCount, toggleCart } = useCart();
  const { favorites, toggleDrawer } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  return <><div className="bg-[#06472f] px-5 py-3 text-center text-xs font-semibold text-white">Thoughtful essentials for everyday life</div><header className="relative border-b border-black/5 bg-white"><nav aria-label="Main navigation" className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-5 py-5 md:px-10">
    <button type="button" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
    <Link href="/" className={`${styles.serif} whitespace-nowrap text-3xl font-semibold tracking-tight md:text-[2.35rem]`}>Drape <span className="text-[#bc8050]">&amp;</span> Line</Link>
    <div className={`${menuOpen ? "flex" : "hidden"} absolute left-0 top-full z-20 w-full flex-col gap-4 border-b border-black/10 bg-white px-6 py-5 text-sm md:static md:flex md:w-auto md:flex-row md:flex-wrap md:items-center md:justify-center md:gap-6 md:border-0 md:p-0`}><Link href="/#shop" onClick={() => setMenuOpen(false)} className="font-semibold hover:text-[#06472f]">Shop All</Link>{categories.map((category) => <Link key={category} href={`/collection/${encodeURIComponent(category)}`} onClick={() => setMenuOpen(false)} className="font-semibold hover:text-[#06472f]">{categoryLabel(category)}</Link>)}<Link href="/login?redirect=/" onClick={() => setMenuOpen(false)} className="font-semibold md:hidden">Account</Link></div>
    <div className="flex items-center gap-4"><Link href="/login?redirect=/" aria-label="Account" className="hidden sm:block"><UserRound size={20} /></Link><button type="button" onClick={toggleDrawer} aria-label={`Open favorites, ${favorites.length} items`}><Heart size={20} /></button><button type="button" onClick={toggleCart} aria-label={`Open bag, ${itemCount} items`} className="relative"><ShoppingBag size={20} /><span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#d9233f] px-1 text-xs font-bold text-white">{itemCount}</span></button></div>
  </nav></header></>;
}

export function StorefrontFooter() {
  return <footer className="bg-[#063d2d] px-5 py-12 text-white md:px-10"><div className="mx-auto grid max-w-[1320px] gap-10 sm:grid-cols-2 lg:grid-cols-[1.3fr_repeat(3,1fr)]"><div><Link href="/" className={`${styles.serif} text-4xl`}>Drape <span className="text-[#bc8050]">&amp;</span> Line</Link><p className="mt-3 text-sm text-white/70">Quality for modern life</p></div>{links.map((column) => <div key={column.title}><h2 className="text-sm font-bold">{column.title}</h2><ul className="mt-4 space-y-2 text-sm text-white/70">{column.items.map((item) => <li key={item.href}><Link className="hover:text-white" href={item.href}>{item.name}</Link></li>)}</ul></div>)}</div><div className="mx-auto mt-10 max-w-[1320px] border-t border-white/20 pt-5 text-xs text-white/70">© {new Date().getFullYear()} Drape &amp; Line. All rights reserved.</div></footer>;
}

export function StorefrontShell({ children }: { children: React.ReactNode }) {
  return <div className={`${styles.storefront} min-h-screen bg-[#fbfaf8] text-[#101414]`}><StorefrontHeader />{children}<StorefrontFooter /></div>;
}
