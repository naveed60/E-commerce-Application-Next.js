"use client";

import { useMemo, useState } from "react";
import { PrimaryHeader } from "./primary-header";
import { HeroSlider } from "./hero-slider";
import { ProductGrid } from "./product-grid";
import { Footer } from "./footer";
import { type StorefrontProduct } from "@/types/product";

type LandingScreenProps = {
  products: StorefrontProduct[];
};

export function LandingScreen({ products }: LandingScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResultsVisible, setSearchResultsVisible] = useState(false);
  const searchSuggestions = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((product) => [product.name, ...product.tags]))
      ).slice(0, 12),
    [products]
  );
  const handleSearchSubmit = (query: string) => {
    setSearchTerm(query);
    setSearchResultsVisible(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <PrimaryHeader
        searchTerm={searchTerm}
        onSearchChange={(v) => {
          setSearchTerm(v);
          if (!v) setSearchResultsVisible(false);
        }}
        onSearchSubmit={handleSearchSubmit}
        searchSuggestions={searchSuggestions}
      />

      <HeroSlider />

      <div className="mx-auto" style={{ maxWidth: "1500px" }}>
        {searchResultsVisible ? (
          <div ref={(el) => el?.scrollIntoView({ behavior: "smooth" })}>
            <ProductGrid products={products} searchTerm={searchTerm} />
          </div>
        ) : (
          <ProductGrid products={products} searchTerm="" />
        )}

      </div>

      <Footer />
    </div>
  );
}

function PolicyCards() {
  const policies = [
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s-8-4-8-10V5l8-3 8 3v7c0 6-8 10-8 10z"/>
        </svg>
      ),
      title: "Eco-Friendly Materials",
      desc: "We craft our furniture using responsibly sourced materials that minimize environmental impact.",
    },
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
      ),
      title: "Effortless Assembly",
      desc: "Thoughtfully designed for quick setup with easy-to-follow instructions included.",
    },
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10"/>
          <polyline points="1 20 1 14 7 14"/>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
        </svg>
      ),
      title: "Giving Back to Nature",
      desc: "Every purchase contributes to reforestation efforts and sustainable forestry initiatives.",
    },
    {
      icon: (
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10"/>
          <path d="M12 12 17 7"/>
          <path d="M12 12 7 12"/>
        </svg>
      ),
      title: "Sustainable Production",
      desc: "Dedicated to reducing waste through responsible manufacturing and eco-friendly packaging.",
    },
  ];

  return (
    <section className="pb-20 pt-10" style={{ paddingBottom: "60px", paddingTop: "40px" }}>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {policies.map((policy) => (
          <div key={policy.title} className="text-center sm:text-left">
            <div className="mx-auto mb-5 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#f5f5f5] text-[#181818] sm:mx-0">
              {policy.icon}
            </div>
            <h3 className="mb-1 text-[1.6rem] font-bold text-[#181818]">{policy.title}</h3>
            <p className="mt-1.5 max-w-[500px] text-[1.4rem] leading-relaxed text-[#535353]">{policy.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
