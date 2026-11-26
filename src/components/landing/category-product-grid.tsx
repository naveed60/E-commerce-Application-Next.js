"use client";

import { useState } from "react";
import { type StorefrontProduct } from "@/types/product";
import { ProductModal } from "./product-modal";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useRouter } from "next/navigation";
import { useSectionSearch } from "./section-layout";
import { StorefrontProductCard } from "./storefront-product-card";

type CategoryProductGridProps = {
  products: StorefrontProduct[];
  searchTerm?: string;
};

export function CategoryProductGrid({
  products,
  searchTerm,
}: CategoryProductGridProps) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { status } = useSession();
  const router = useRouter();
  const sectionSearch = useSectionSearch();
  const [selectedProduct, setSelectedProduct] = useState<StorefrontProduct | null>(null);
  const effectiveSearchTerm = searchTerm ?? sectionSearch?.searchTerm ?? "";
  const normalized = effectiveSearchTerm.trim().toLowerCase();
  const visibleProducts = products.filter((product) => {
    if (!normalized) return true;

    return (
      product.name.toLowerCase().includes(normalized) ||
      product.description.toLowerCase().includes(normalized) ||
      product.tags.some((tag) => tag.toLowerCase().includes(normalized))
    );
  });

  if (products.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500">
        No products in this category yet.
      </div>
    );
  }

  if (visibleProducts.length === 0) {
    return (
      <div className="rounded-[24px] border border-dashed border-zinc-200 p-10 text-center text-sm text-zinc-500">
        Nothing matches &quot;{effectiveSearchTerm}&quot;. Try a different keyword.
      </div>
    );
  }

  const handleCart = (product: StorefrontProduct) => {
    if (product.hasVariants) { router.push(`/products/${encodeURIComponent(product.id)}`); return; }
    if (status === "authenticated") {
      addItem(product);
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error("Please sign in to add items to the cart");
      router.push("/login?redirect=/");
    }
  };

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visibleProducts.map((product) => (
          <StorefrontProductCard
            key={product.id}
            product={product}
            isFavorite={isFavorite(product.id)}
            onToggleFavorite={toggleFavorite}
            onAddToCart={() => handleCart(product)}
            onView={setSelectedProduct}
          />
        ))}
      </div>
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </>
  );
}
