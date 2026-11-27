import Link from "next/link";
import { Search } from "lucide-react";
import type { StorefrontProduct } from "@/types/product";
import styles from "./storefront-design.module.css";
import { PRODUCT_CATEGORY_VALUES, categoryLabel } from "@/lib/product-categories";
import { StorefrontHeader, StorefrontFooter } from "./storefront-shell";
import { CatalogImage } from "./catalog-image";
import { CatalogCard } from "./catalog-card";

const categoryImages: Record<string, string> = {
  men: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?auto=format&fit=crop&w=500&q=85",
  women: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=500&q=85",
  kids: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=500&q=85",
  accessories: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=500&q=85",
};

export function LandingScreen({ products }: { products: StorefrontProduct[] }) {
  return <div className={`${styles.storefront} min-h-screen overflow-x-hidden bg-[#fbfaf8] text-[#101414]`}>
    <StorefrontHeader />
    <main>
      <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-10 md:grid-cols-[.8fr_1.2fr] md:px-10 md:py-12">
        <div className="order-2 md:order-1">
          <p className="text-xs font-bold uppercase tracking-[.3em] text-[#d9233f]">New collection</p>
          <h1 className={`${styles.serif} mt-5 max-w-lg text-6xl leading-[.92] md:text-[5.7rem]`}>Everyday<br />Style for<br />Everyone</h1>
          <p className="mt-7 max-w-md text-base leading-7 text-black/70">Explore clothing for men, women and kids, plus accessories for everyday dressing.</p>
          <div className="mt-8 flex flex-wrap gap-4"><Link href="/shop" className="rounded-full bg-[#06472f] px-7 py-4 text-sm font-bold text-white">Shop Now</Link><a href="#collections" className="rounded-full border border-black/60 px-7 py-4 text-sm font-bold">View Collections</a></div>
        </div>
        <div className="relative order-1 h-[430px] overflow-hidden rounded-[40px] md:order-2 md:h-[560px]"><CatalogImage src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85" alt="Woman in a burgundy fashion look" sizes="(min-width: 768px) 60vw, 100vw" eager /></div>
      </section>
      <section id="collections" aria-label="Shop by category" className="mx-auto grid max-w-[1320px] gap-4 px-5 pb-16 sm:grid-cols-2 md:grid-cols-4 md:px-10">
        {PRODUCT_CATEGORY_VALUES.map((category) => <Link key={category} href={`/collection/${category}`} className="group relative flex h-32 items-center overflow-hidden rounded-3xl bg-[#52685d] text-white"><CatalogImage src={categoryImages[category]} alt="" sizes="(min-width: 768px) 25vw, (min-width: 640px) 50vw, 100vw" /><span className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" /><span className={`${styles.serif} relative pl-7 text-2xl font-semibold`}>{categoryLabel(category)}</span></Link>)}
      </section>
      <section id="shop" className="mx-auto max-w-[1320px] px-5 pb-20 md:px-10">
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.3em] text-[#d9233f]">New arrivals</p><h2 className={`${styles.serif} mt-2 text-5xl md:text-6xl`}>Latest Collection</h2></div>
        <form action="/shop" method="get" role="search" className="mb-8 flex max-w-xl gap-3"><label className="flex flex-1 items-center gap-2 rounded-full border border-black/15 bg-white px-4 py-2"><Search size={17} /><span className="sr-only">Search all products</span><input name="q" maxLength={100} placeholder="Search all products" className="w-full bg-transparent text-sm outline-none" /></label><button className="rounded-full bg-[#06472f] px-5 py-2 text-sm font-bold text-white">Search</button></form>
        {products.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">{products.map((product) => <CatalogCard key={product.id} product={product} heading="h3" />)}</div> : <p className="rounded-xl bg-white p-8 text-center text-sm">No products are available yet.</p>}
        <Link href="/shop" className="mt-10 inline-flex rounded-full border border-[#06472f] px-7 py-3 text-sm font-bold text-[#06472f]">View all products</Link>
      </section>
    </main>
    <StorefrontFooter />
  </div>;
}
