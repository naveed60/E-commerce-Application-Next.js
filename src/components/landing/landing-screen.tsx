"use client";

import Image from "next/image";
import { ArrowRight, CircleEllipsis, Mail, ShoppingBag, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { PrimaryHeader } from "./primary-header";
import { HeroSlider } from "./hero-slider";
import { ProductGrid } from "./product-grid";
import { Footer } from "./footer";
import { type StorefrontProduct } from "@/types/product";
import { toast } from "sonner";

type LandingScreenProps = { products: StorefrontProduct[]; databaseUnavailable?: boolean };

const categories = [
  { name: "Electronics", image: "/shopkart/category-electronics.jpg" },
  { name: "Fashion", image: "/shopkart/category-fashion.jpg" },
  { name: "Home & Living", image: "/shopkart/category-home.jpg" },
  { name: "Beauty", image: "/shopkart/category-beauty.jpg" },
  { name: "Sports", image: "/shopkart/category-sports.jpg" },
  { name: "Toys", image: "/shopkart/category-toys.jpg" },
];

export function LandingScreen({ products, databaseUnavailable = false }: LandingScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const searchSuggestions = useMemo(() => Array.from(new Set(products.flatMap((product) => [product.name, ...product.tags]))).slice(0, 12), [products]);

  return (
    <div className="storefront min-h-screen bg-white">
      <PrimaryHeader searchTerm={searchTerm} onSearchChange={(value) => { setSearchTerm(value); if (!value) setSubmittedSearch(""); }} onSearchSubmit={setSubmittedSearch} searchSuggestions={searchSuggestions} />
      <main>
        <HeroSlider />
        <div className="shop-container px-4 lg:px-6">
          {databaseUnavailable && <p className="mt-4 rounded-md bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">Live inventory is temporarily unavailable. Featured products are still available to browse.</p>}
          <CategoryStrip />
          <ProductGrid products={products} searchTerm={submittedSearch} />
          <Promotions />
          <Newsletter />
        </div>
      </main>
      <Footer />
    </div>
  );
}

function CategoryStrip() {
  return (
    <section aria-label="Popular categories" className="grid grid-cols-4 gap-4 py-7 sm:grid-cols-7 sm:gap-5">
      {categories.map((category) => (
        <a key={category.name} href={`#${category.name.toLowerCase().replaceAll(" ", "-")}`} className="group text-center">
          <span className="relative mx-auto block aspect-square max-w-[112px] overflow-hidden rounded-full bg-[#f0f5fb] ring-1 ring-[#edf2f7] transition group-hover:-translate-y-1 group-hover:ring-[#b9dcff]">
            <Image src={category.image} alt={category.name} fill sizes="112px" className="object-cover" />
          </span>
          <span className="mt-2.5 block text-[11px] font-bold text-[#101828] sm:text-sm">{category.name}</span>
        </a>
      ))}
      <a href="#featured-products" className="group text-center">
        <span className="mx-auto grid aspect-square max-w-[112px] place-items-center rounded-full bg-[#f0f5fb] text-[#101828] ring-1 ring-[#edf2f7] transition group-hover:-translate-y-1 group-hover:text-[#087df1]"><CircleEllipsis className="h-9 w-9" /></span>
        <span className="mt-2.5 block text-[11px] font-bold text-[#101828] sm:text-sm">More</span>
      </a>
    </section>
  );
}

function Promotions() {
  return (
    <section className="grid gap-4 pb-6 md:grid-cols-2">
      <div className="relative flex min-h-[190px] overflow-hidden rounded-xl bg-gradient-to-r from-[#bff5dd] to-[#86dfc0] p-7 sm:p-9">
        <div className="relative z-10"><p className="text-2xl font-black leading-tight text-[#073e32]">Summer Sale<br /><span className="text-[#008a69]">Up to 50% OFF</span></p><a href="#featured-products" className="mt-5 inline-flex rounded-md bg-white px-6 py-2.5 text-sm font-bold text-[#071526] shadow-sm">Shop Now</a></div>
        <Sparkles className="absolute -bottom-7 right-8 h-40 w-40 rotate-[-15deg] text-[#0aa981]/25" strokeWidth={1} />
      </div>
      <div className="relative flex min-h-[190px] overflow-hidden rounded-xl bg-gradient-to-r from-[#ffe0cb] to-[#ffc493] p-7 sm:p-9">
        <div className="relative z-10"><p className="text-2xl font-black leading-tight text-[#071526]">Top Brands<br />Best Deals</p><a href="#featured-products" className="mt-5 inline-flex rounded-md bg-white px-6 py-2.5 text-sm font-bold text-[#071526] shadow-sm">Shop Now</a></div>
        <ShoppingBag className="absolute -bottom-6 right-10 h-40 w-40 text-[#d67621]/55" strokeWidth={1.25} />
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="mb-8 flex flex-col items-center gap-5 rounded-xl bg-[#e4f2ff] p-6 sm:flex-row sm:p-8">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#cce7ff] text-[#087df1]"><Mail className="h-7 w-7" /></span>
      <div className="text-center sm:text-left"><h2 className="text-xl font-black text-[#071526]">Stay Updated</h2><p className="mt-1 text-sm text-[#5d6b7c]">Get the latest offers, new arrivals and exclusive deals.</p></div>
      <form className="flex w-full overflow-hidden rounded-md bg-white sm:ml-auto sm:max-w-[450px]" onSubmit={(event) => { event.preventDefault(); toast.success("You’re subscribed to ShopKart updates!"); }}>
        <input type="email" required placeholder="Enter your email" className="min-w-0 flex-1 px-4 py-3 text-sm outline-none" />
        <button className="flex items-center gap-2 bg-[#087df1] px-5 text-sm font-bold text-white">Subscribe <ArrowRight className="hidden h-4 w-4 sm:block" /></button>
      </form>
    </section>
  );
}
