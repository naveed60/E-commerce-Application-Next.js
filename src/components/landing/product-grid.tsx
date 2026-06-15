"use client";

import { useRef, useState } from "react";
import { type StorefrontProduct } from "@/types/product";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useRouter } from "next/navigation";
import { ProductModal } from "./product-modal";
import { StorefrontProductCard } from "./storefront-product-card";

type ProductGridProps = {
  searchTerm: string;
  products: StorefrontProduct[];
};

export function ProductGrid({ searchTerm, products }: ProductGridProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { status } = useSession();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);
  const normalized = searchTerm.trim().toLowerCase();

  const visible = products.filter((p) => {
    if (!normalized) return true;
    return (
      p.name.toLowerCase().includes(normalized) ||
      p.tags.some((t) => t.toLowerCase().includes(normalized))
    );
  });

  const featured = visible.filter((p) => p.featured);
  const newArrivals = visible
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const handleCart = (product: StorefrontProduct) => {
    if (status === "authenticated") {
      addItem(product);
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error("Please sign in to add items to the cart");
      router.push("/login?redirect=/nextshop");
    }
  };

  if (visible.length === 0) {
    return (
      <section className="py-20">
        <div className="border border-dashed border-[#eaeaea] p-10 text-center text-[#535353]">
          Nothing matches &quot;{searchTerm}&quot;. Try a different keyword.
        </div>
      </section>
    );
  }

  return (
    <>
      <div className="py-10">
         {newArrivals.length > 0 && (
          <Section title="FRESH FROM THE COLLECTION" subtitle="NEW ARRIVALS">
            <ScrollGrid>
              {newArrivals.map((p) => (
                <ScrollItem key={p.id}>
                  <StorefrontProductCard
                    product={p}
                    isFavorite={isFavorite(p.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={() => handleCart(p)}
                    onView={setSelectedProduct}
                  />
                </ScrollItem>
              ))}
            </ScrollGrid>
          </Section>
        )}
        {featured.length > 0 && (
          <Section title="TIMELESS ELEGANCE FOR YOUR HOME" subtitle="HANDPICKED ELEGANCE">
            <ScrollGrid>
              {featured.map((p) => (
                <ScrollItem key={p.id}>
                  <StorefrontProductCard
                    product={p}
                    isFavorite={isFavorite(p.id)}
                    onToggleFavorite={toggleFavorite}
                    onAddToCart={() => handleCart(p)}
                    onView={setSelectedProduct}
                  />
                </ScrollItem>
              ))}
            </ScrollGrid>
          </Section>
        )}

       
      </div>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <div className="mb-12 flex items-end justify-between">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[1px] text-[#b7b7b7]">{title}</p>
          <h2 className="text-[2.4rem] font-bold text-[#181818]">{subtitle}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function ScrollGrid({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="group relative">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute -left-4 top-1/3 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#181818] shadow-md transition hover:bg-[#fdc402] group-hover:flex"
        aria-label="Scroll left"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <div
        ref={scrollRef}
        className="flex gap-[30px] overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute -right-4 top-1/3 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#181818] shadow-md transition hover:bg-[#fdc402] group-hover:flex"
        aria-label="Scroll right"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  );
}

function ScrollItem({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-w-0 shrink-0"
      style={{
        width: "calc(20% - 24px)",
        minWidth: "220px",
        scrollSnapAlign: "start",
      }}
    >
      {children}
    </div>
  );
}
