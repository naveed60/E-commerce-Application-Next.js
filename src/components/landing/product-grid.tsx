"use client";

import Image from "next/image";
import { Heart, Star } from "lucide-react";
import { type StorefrontProduct } from "@/types/product";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useRouter } from "next/navigation";

type ProductGridProps = { searchTerm: string; products: StorefrontProduct[] };

const showcaseProducts: Array<StorefrontProduct & { oldPrice: number; reviews: number }> = [
  { id: "wireless-headphones", name: "Wireless Headphones", description: "Immersive sound with all-day comfort.", price: 2999, oldPrice: 4999, image: "/shopkart/product-headphones.jpg", tags: ["electronics", "audio", "headphones"], rating: 4.8, reviews: 120, featured: true, category: "Electronics", createdAt: "2026-09-01T00:00:00.000Z" },
  { id: "running-shoes", name: "Running Shoes", description: "Lightweight support for every stride.", price: 1899, oldPrice: 2999, image: "/shopkart/product-shoes.jpg", tags: ["sports", "shoes", "fashion"], rating: 4.7, reviews: 98, featured: true, category: "Sports", createdAt: "2026-09-02T00:00:00.000Z" },
  { id: "smart-watch", name: "Smart Watch", description: "Stay connected, active and in control.", price: 3499, oldPrice: 6999, image: "/shopkart/product-watch.jpg", tags: ["electronics", "watch", "wearable"], rating: 4.9, reviews: 210, featured: true, category: "Electronics", createdAt: "2026-09-03T00:00:00.000Z" },
  { id: "travel-backpack", name: "Travel Backpack", description: "Smart storage for daily adventures.", price: 1299, oldPrice: 2499, image: "/shopkart/product-backpack.jpg", tags: ["fashion", "travel", "backpack"], rating: 4.7, reviews: 86, featured: true, category: "Fashion", createdAt: "2026-09-04T00:00:00.000Z" },
];

const money = (amount: number) => `Rs ${new Intl.NumberFormat("en-PK").format(amount)}`;

export function ProductGrid({ searchTerm }: ProductGridProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { status } = useSession();
  const router = useRouter();
  const query = searchTerm.trim().toLowerCase();
  const visible = showcaseProducts.filter((product) => !query || [product.name, product.category, ...product.tags].some((value) => value.toLowerCase().includes(query)));

  const addToCart = (product: StorefrontProduct) => {
    if (status !== "authenticated") {
      toast.error("Please sign in to add items to the cart");
      router.push("/login?redirect=/nextshop");
      return;
    }
    addItem(product);
    toast.success(`${product.name} added to cart`);
  };

  return (
    <section id="featured-products" className="py-8 sm:py-10">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-[#071526] sm:text-[30px]">Featured Products</h2>
        <button className="text-sm font-bold text-[#087df1]">View All <span aria-hidden>→</span></button>
      </div>
      {visible.length ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {visible.map((product) => (
            <article key={product.id} className="group overflow-hidden rounded-lg border border-[#dfe7ef] bg-white p-3 shadow-[0_2px_10px_rgba(20,49,81,.04)] transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(20,49,81,.12)] sm:p-4">
              <div className="relative mb-4 aspect-[1.25] overflow-hidden rounded-md bg-[#f4f7fa]">
                <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-cover transition duration-500 group-hover:scale-105" />
                <button type="button" onClick={() => toggleFavorite(product)} aria-label="Toggle favorite" className="absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#142033] shadow-sm">
                  <Heart className={`h-[18px] w-[18px] ${isFavorite(product.id) ? "fill-[#ef2b2d] text-[#ef2b2d]" : ""}`} />
                </button>
              </div>
              <h3 className="truncate text-sm font-bold text-[#101828] sm:text-base">{product.name}</h3>
              <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2">
                <strong className="text-sm text-[#071526] sm:text-base">{money(product.price)}</strong>
                <span className="text-[11px] text-[#98a2b3] line-through sm:text-xs">{money(product.oldPrice)}</span>
              </div>
              <div className="my-2.5 flex items-center gap-1 text-[#f6b900]">
                {[0, 1, 2, 3, 4].map((star) => <Star key={star} className="h-3.5 w-3.5 fill-current" />)}
                <span className="ml-1 text-[11px] text-[#667085]">({product.reviews})</span>
              </div>
              <button type="button" onClick={() => addToCart(product)} className="w-full rounded-md bg-[#087df1] py-2.5 text-xs font-bold text-white transition hover:bg-[#0569cc] sm:text-sm">Add to Cart</button>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-[#cdd9e7] bg-[#f8faff] p-10 text-center text-sm text-[#667085]">Nothing matches “{searchTerm}”. Try another search.</div>
      )}
    </section>
  );
}
