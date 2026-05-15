"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { PrimaryHeader } from "./primary-header";
import { HeroSlider } from "./hero-slider";
import { ProductGrid } from "./product-grid";
import { Footer } from "./footer";
import { Sparkles, ShieldCheck, Truck } from "lucide-react";
import { StaggerContainer, StaggerItem } from "@/components/animations/stagger-container";
import { type StorefrontProduct } from "@/types/product";

type LandingScreenProps = {
  products: StorefrontProduct[];
};

export function LandingScreen({ products }: LandingScreenProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const productGridRef = useRef<HTMLDivElement | null>(null);
  const searchSuggestions = useMemo(
    () =>
      Array.from(
        new Set(products.flatMap((product) => [product.name, ...product.tags]))
      ).slice(0, 12),
    [products]
  );
  const handleSearchSubmit = (query: string) => {
    setSearchTerm(query);
    productGridRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50/60 pb-20">
      <div className="mx-auto max-w-6xl px-4 pb-16">
        <PrimaryHeader
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          searchSuggestions={searchSuggestions}
        />
        <div className="mt-6">
          <HeroSlider />
        </div>
        <StaggerContainer className="mt-12 grid gap-4 sm:grid-cols-3">
          <StaggerItem>
            <FeatureCard
              icon={<Sparkles className="h-5 w-5" />}
              iconBg="bg-violet-50 text-violet-600"
              heading="Hand curated"
              text="Every drop is edited by our design team and tested by the community."
            />
          </StaggerItem>
          <StaggerItem>
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              iconBg="bg-blue-50 text-blue-600"
              heading="Secure checkout"
              text="NextAuth powered authentication and encrypted payments out of the box."
            />
          </StaggerItem>
          <StaggerItem>
            <FeatureCard
              icon={<Truck className="h-5 w-5" />}
              iconBg="bg-emerald-50 text-emerald-600"
              heading="Express delivery"
              text="Global shipping in 48h with adaptive tracking updates."
            />
          </StaggerItem>
        </StaggerContainer>
        <div ref={productGridRef} id="search-results">
          <ProductGrid products={products} searchTerm={searchTerm} />
        </div>
      
        <Footer />
      </div>
    </div>
  );
}

type FeatureCardProps = {
  icon: ReactNode;
  heading: string;
  text: string;
  iconBg?: string;
};

function FeatureCard({ icon, heading, text, iconBg = "bg-zinc-100 text-zinc-600" }: FeatureCardProps) {
  return (
    <div className="rounded-[28px] border border-violet-100/70 bg-white p-6 shadow-md shadow-violet-100/30">
      <div className={`mb-4 inline-flex items-center justify-center rounded-2xl p-3 ${iconBg}`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-zinc-900">{heading}</h3>
      <p className="mt-2 text-sm text-zinc-500">{text}</p>
    </div>
  );
}
