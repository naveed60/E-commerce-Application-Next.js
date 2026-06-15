"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { getValidImageUrl } from "@/lib/utils";
import { type StorefrontProduct } from "@/types/product";

type StorefrontProductCardProps = {
  product: StorefrontProduct;
  isFavorite: boolean;
  onToggleFavorite: (product: StorefrontProduct) => void;
  onAddToCart: () => void;
  onView?: (product: StorefrontProduct) => void;
};

function formatCardPrice(amount: number) {
  return `Rs.${new Intl.NumberFormat("en-PK").format(Math.round(amount))}`;
}

function getPromoPercent(product: StorefrontProduct) {
  if (product.featured) return 80;
  return Math.min(70, 35 + product.tags.length * 10);
}

function getComparePrice(price: number, promoPercent: number) {
  const multiplier = 1 / (1 - promoPercent / 100);
  return Math.max(price, Math.round(price * multiplier));
}

const SWATCH_CLASSES = [
  "bg-zinc-800",
  "bg-rose-100",
  "bg-slate-300",
  "bg-indigo-200",
  "bg-amber-100",
];

export function StorefrontProductCard({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onView,
}: StorefrontProductCardProps) {
  const promoPercent = getPromoPercent(product);
  const comparePrice = getComparePrice(product.price, promoPercent);
  const swatches = SWATCH_CLASSES.slice(0, Math.max(3, Math.min(4, product.tags.length + 1)));

  return (
    <article className="group relative bg-white transition-shadow hover:shadow-lg">
      <div className="relative overflow-hidden bg-[#f9f9f9]" style={{ paddingTop: "124%" }}>
        <Link href={`/nextshop/products/${product.id}`} className="absolute inset-0">
          {getValidImageUrl(product.image) ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1280px) 20vw, (min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center text-xs font-semibold uppercase tracking-[0.2em] text-zinc-300">
              Image unavailable
            </div>
          )}
        </Link>

        {product.featured && (
          <span style={{ backgroundColor: "#e85b40" }} className="absolute left-0 top-0 z-10 px-3 py-1 text-xs font-semibold text-white">
            Sale
          </span>
        )}

        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          {onView && (
            <button
              type="button"
              aria-label="Quick view"
              onClick={() => onView(product)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#181818] shadow-md transition hover:bg-[#fdc402] hover:text-black"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            onClick={() => onToggleFavorite(product)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#181818] shadow-md transition hover:bg-[#fdc402] hover:text-black"
          >
            <Heart className={`h-4 w-4 ${isFavorite ? "fill-[#e85b40] text-[#e85b40]" : ""}`} />
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 translate-y-full px-3 pb-3 transition-transform group-hover:translate-y-0">
          <button
            type="button"
            onClick={onAddToCart}
            className="flex w-full items-center justify-center gap-2 bg-white py-3 text-sm font-bold uppercase tracking-wide text-[#181818] transition hover:bg-[#fdc402] hover:text-black"
          >
            <ShoppingBag className="h-4 w-4" />
            Add to cart
          </button>
        </div>
      </div>

      <div className="px-0 pb-5 pt-4">
        <h3 className="mb-1 text-[1.4rem] font-bold text-[#181818] transition-colors hover:text-[#fdc402]">
          <Link href={`/nextshop/products/${product.id}`}>{product.name}</Link>
        </h3>
        <p className="mb-4 line-clamp-1 text-[1.3rem] text-[#535353]">{product.description}</p>

        <div className="mb-3 flex items-center gap-2">
          {swatches.map((swatchClass, index) => (
            <span
              key={`${product.id}-swatch-${index}`}
              className={`h-4 w-4 rounded-full border border-[#eaeaea] ${swatchClass}`}
            />
          ))}
          {product.tags.length > 3 && (
            <span className="text-xs text-[#535353]">+{product.tags.length - 3}</span>
          )}
        </div>

        <div className="flex items-center gap-3">
          {promoPercent > 0 && (
            <span className="text-[1.3rem] text-[#b5b5b5] line-through">{formatCardPrice(comparePrice)}</span>
          )}
          <span className="text-[1.5rem] font-bold text-[#181818]">{formatCardPrice(product.price)}</span>
        </div>
      </div>
    </article>
  );
}
