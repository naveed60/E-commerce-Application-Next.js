"use client";

import Link from "next/link";
import { Heart, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { useState } from "react";
import type { FormEvent, ReactElement } from "react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type HeaderProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  searchSuggestions?: string[];
};

const navItems = ["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Toys", "Deals"];

export function ShopKartLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 font-black tracking-tight">
      <ShoppingCart className={inverted ? "text-white" : "text-[#087df1]"} strokeWidth={3} />
      <span className={inverted ? "text-white" : "text-[#071526]"}>Shop<span className={inverted ? "text-white" : "text-[#087df1]"}>Kart</span></span>
    </span>
  );
}

export function PrimaryHeader({ searchTerm, onSearchChange, onSearchSubmit }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { itemCount, toggleCart } = useCart();
  const { favorites, toggleDrawer } = useFavorites();
  const { status } = useSession();
  const router = useRouter();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSearchSubmit?.(searchTerm);
  };

  const openAccount = () => router.push(status === "authenticated" ? "/nextshop" : "/login?redirect=/nextshop");

  return (
    <header className="shop-header sticky top-0 z-40 bg-white">
      <div className="shop-container flex h-[76px] items-center gap-5 px-4 lg:px-6">
        <Link href="/nextshop" aria-label="ShopKart homepage" className="shrink-0 text-[25px]"><ShopKartLogo /></Link>

        <form onSubmit={submit} className="mx-auto hidden h-11 max-w-[560px] flex-1 overflow-hidden rounded-md border border-[#dfe7ef] bg-[#f7f9fb] md:flex">
          <input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search for products..." className="min-w-0 flex-1 bg-transparent px-5 text-sm text-[#344054] outline-none placeholder:text-[#8c98a8]" />
          <button type="submit" className="grid w-[54px] place-items-center bg-[#087df1] text-white transition hover:bg-[#0569cc]" aria-label="Search"><Search className="h-5 w-5" /></button>
        </form>

        <div className="ml-auto flex items-center gap-3 sm:gap-6">
          <HeaderAction label={status === "authenticated" ? "Profile" : "Account"} onClick={openAccount} icon={<UserRound />} />
          <HeaderAction label="Wishlist" onClick={toggleDrawer} icon={<Heart className={favorites.length ? "fill-[#087df1] text-[#087df1]" : ""} />} count={favorites.length} />
          <HeaderAction label="Cart" onClick={toggleCart} icon={<ShoppingCart />} count={itemCount} />
          <button type="button" className="grid h-10 w-10 place-items-center text-[#071526] lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
        </div>
      </div>

      <form onSubmit={submit} className="mx-4 mb-3 flex h-11 overflow-hidden rounded-md border border-[#dfe7ef] bg-[#f7f9fb] md:hidden">
        <input value={searchTerm} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search for products..." className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none" />
        <button className="grid w-12 place-items-center bg-[#087df1] text-white" aria-label="Search"><Search className="h-5 w-5" /></button>
      </form>

      <nav className="border-y border-[#e8eef5] bg-[#f8faff]">
        <div className="shop-container hidden items-center px-6 lg:flex" style={{ height: 46 }}>
          <button className="mr-11 flex items-center gap-2 text-sm font-bold text-[#101828]"><Menu className="h-4 w-4" /> All Categories</button>
          <div className="flex flex-1 items-center justify-between">
            {navItems.map((item) => <a href={`#${item.toLowerCase().replaceAll(" ", "-")}`} key={item} className="text-sm font-semibold text-[#344054] transition hover:text-[#087df1]">{item}</a>)}
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/30" onClick={() => setMenuOpen(false)}>
          <aside className="ml-auto h-full w-[290px] bg-white p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-8 flex items-center justify-between text-xl"><ShopKartLogo /><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
            <div className="space-y-1">
              {navItems.map((item) => <a key={item} href={`#${item.toLowerCase().replaceAll(" ", "-")}`} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-3 text-sm font-semibold text-[#344054] hover:bg-[#f2f7ff]">{item}</a>)}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}

function HeaderAction({ label, icon, count, onClick }: { label: string; icon: ReactElement; count?: number; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="relative flex min-w-9 flex-col items-center gap-0.5 text-[#111827] transition hover:text-[#087df1]">
      <span className="[&>svg]:h-[22px] [&>svg]:w-[22px]">{icon}</span>
      <span className="hidden text-[11px] font-medium sm:block">{label}</span>
      {!!count && <span className="absolute -right-0.5 -top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#ef2b2d] px-1 text-[10px] font-bold text-white">{count}</span>}
    </button>
  );
}
