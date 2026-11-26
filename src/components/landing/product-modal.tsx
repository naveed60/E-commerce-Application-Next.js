"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, Heart, ShoppingBag, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type StorefrontProduct } from "@/types/product";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getValidImageUrl, cn, formatPrice } from "@/lib/utils";

const CATEGORY_LABELS: Record<string, string> = {
  "men-un-stitch":   "Men — Un-Stitch",
  "men-stitch":      "Men — Stitch",
  "men-watches":     "Men — Watches",
  "men-perfumes":    "Men — Perfumes",
  "men-cufflinks":   "Men — Cufflinks",
  "women-un-stitch": "Women — Un-Stitch",
  "women-stitch":    "Women — Stitch",
  "women-watches":   "Women — Watches",
  "women-perfumes":  "Women — Perfumes",
  "women-cufflinks": "Women — Cufflinks",
  "kids-baby-boys":  "Kids — Baby Boys Suits",
  "kids-baby-girls": "Kids — Baby Girls Suits",
};

type Props = {
  product: StorefrontProduct;
  onClose: () => void;
};

export function ProductModal({ product, onClose }: Props) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { status } = useSession();
  const router = useRouter();

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleCart = () => {
    if (product.hasVariants) { router.push(`/products/${encodeURIComponent(product.id)}`); return; }
    if (status === "authenticated") {
      addItem(product);
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error("Please sign in to add items to the cart");
      router.push("/login?redirect=/");
      onClose();
    }
  };

  const validImage = getValidImageUrl(product.image);
  const favorited = isFavorite(product.id);
  const categoryLabel = CATEGORY_LABELS[product.category] ?? product.category;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[32px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-md transition hover:bg-zinc-100"
          aria-label="Close"
        >
          <X className="h-4 w-4 text-zinc-600" />
        </button>

        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative aspect-square bg-zinc-100">
            {validImage ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Image unavailable
              </div>
            )}
            {product.featured && (
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-500 shadow">
                Featured
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5 p-7">
            {/* Category */}
            {categoryLabel && (
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                <Tag className="h-3 w-3" />
                {categoryLabel}
              </div>
            )}

            {/* Name + rating */}
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">{product.name}</h2>
              <div className="mt-1.5 flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-200"
                    )}
                  />
                ))}
                <span className="ml-1 text-sm font-semibold text-zinc-600">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm leading-6 text-zinc-500">{product.description}</p>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Price */}
            <p className="text-3xl font-semibold text-zinc-900">
              {formatPrice(product.price)}
            </p>

            {/* Actions */}
            <div className="mt-auto flex flex-col gap-3">
              <Button
                variant="primary"
                className="flex w-full items-center justify-center gap-2"
                onClick={handleCart}
              >
                <ShoppingBag className="h-4 w-4" />
                {product.hasVariants ? "Choose options" : "Add to cart"}
              </Button>
              <button
                type="button"
                onClick={() => {
                  toggleFavorite(product);
                  toast.success(
                    favorited
                      ? `${product.name} removed from favorites`
                      : `${product.name} added to favorites`
                  );
                }}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition",
                  favorited
                    ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "border-zinc-200 text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                )}
              >
                <Heart className={cn("h-4 w-4", favorited && "fill-rose-500 text-rose-500")} />
                {favorited ? "Remove from favorites" : "Save to favorites"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
