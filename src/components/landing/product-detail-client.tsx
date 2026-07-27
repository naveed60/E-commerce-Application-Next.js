"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ZoomIn,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { PrimaryHeader } from "./primary-header";
import { Footer } from "./footer";
import { cn, formatPrice } from "@/lib/utils";
import { type StorefrontProduct } from "@/types/product";

type Product = StorefrontProduct & { inventory: number };

type Props = {
  product: Product;
  related: Product[];
  categoryLabel: string;
  validImage: string | null;
};

export function ProductDetailClient({ product, related, categoryLabel, validImage }: Props) {
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { status } = useSession();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [zoomed, setZoomed] = useState(false);
  const searchSuggestions = useMemo(
    () =>
      Array.from(
        new Set(
          [product, ...related].flatMap((item) => [item.name, ...item.tags])
        )
      ).slice(0, 12),
    [product, related]
  );

  const favorited = isFavorite(product.id);
  const inStock = product.inventory > 0;

  const handleCart = () => {
    if (status === "authenticated") {
      addItem(product);
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error("Please sign in to add items to the cart");
      router.push("/login?redirect=/nextshop/products/" + product.id);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-50 via-white to-zinc-100">
      <PrimaryHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchSuggestions={searchSuggestions}
      />

      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-16">
      {/* Breadcrumb */}
      <nav className="mt-6 flex items-center gap-2 text-xs text-zinc-400">
        <Link href="/nextshop" className="hover:text-zinc-700 transition">Home</Link>
        <span>/</span>
        {categoryLabel && (
          <>
            <span className="hover:text-zinc-700 transition">{categoryLabel}</span>
            <span>/</span>
          </>
        )}
        <span className="text-zinc-600 font-medium">{product.name}</span>
      </nav>

      {/* Back */}
      <button
        type="button"
        onClick={() => router.back()}
        className="mt-4 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 transition"
      >
        <ChevronLeft className="h-4 w-4" />
        Back
      </button>

      {/* Main detail card */}
      <div className="mt-6 overflow-hidden rounded-[32px] border border-zinc-100 bg-white shadow-2xl">
        <div className="grid md:grid-cols-2">

          {/* Image */}
          <div
            className="relative aspect-square cursor-zoom-in bg-zinc-100"
            onClick={() => setZoomed(true)}
          >
            {validImage ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
                priority
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
            <span className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow">
              <ZoomIn className="h-4 w-4 text-zinc-500" />
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col gap-5 p-8">
            {/* Name */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                {categoryLabel}
              </p>
              <h1 className="mt-1 text-3xl font-bold text-zinc-900">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-zinc-900">
                {formatPrice(product.price)}
              </span>
              {product.featured && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">
                  FEATURED PICK
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "h-4 w-4",
                      star <= Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-zinc-200 fill-zinc-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm font-semibold text-zinc-600">
                {product.rating.toFixed(1)} / 5.0
              </span>
            </div>

            {/* Meta rows */}
            <div className="space-y-2 border-t border-zinc-100 pt-4 text-sm">
              {categoryLabel && (
                <div className="flex gap-2">
                  <span className="w-32 font-semibold text-zinc-500">Type</span>
                  <span className="text-zinc-700">{categoryLabel}</span>
                </div>
              )}
              <div className="flex gap-2">
                <span className="w-32 font-semibold text-zinc-500">Product Code</span>
                <span className="font-mono text-zinc-700">{product.id.slice(0, 12).toUpperCase()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 font-semibold text-zinc-500">Availability</span>
                <span className={cn("flex items-center gap-1 font-semibold", inStock ? "text-emerald-600" : "text-rose-500")}>
                  {inStock ? (
                    <><CheckCircle2 className="h-4 w-4" /> IN STOCK</>
                  ) : (
                    "OUT OF STOCK"
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-32 font-semibold text-zinc-500">Shipping</span>
                <span className="flex items-center gap-1.5 text-zinc-700">
                  <Truck className="h-4 w-4 text-zinc-400" />
                  Eligible for free shipping
                </span>
              </div>
            </div>

            {/* Quality tags */}
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Color Guarantee
              </span>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                High Quality Fabric
              </span>
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-500"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="border-t border-zinc-100 pt-4">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-zinc-400">
                Description
              </h2>
              <p className="text-sm leading-6 text-zinc-600">{product.description}</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleCart}
                  disabled={!inStock}
                  className="flex items-center justify-center gap-2 rounded-2xl border-2 border-zinc-900 px-4 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-900 hover:text-white disabled:opacity-50"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Add to Cart
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleCart();
                  }}
                  disabled={!inStock}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-bold text-white transition hover:bg-zinc-700 disabled:opacity-50"
                >
                  Buy it Now
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  toggleFavorite(product);
                  toast.success(favorited ? "Removed from favorites" : "Added to favorites");
                }}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition",
                  favorited
                    ? "border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100"
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-400"
                )}
              >
                <Heart className={cn("h-4 w-4", favorited && "fill-rose-500 text-rose-500")} />
                {favorited ? "Remove from favorites" : "Save to favorites"}
              </button>
            </div>

            {/* Payment methods */}
            <div className="flex items-center gap-3 border-t border-zinc-100 pt-4">
              <span className="text-xs font-semibold text-zinc-400">We accept</span>
              {["COD", "Bank", "Visa", "Mastercard"].map((method) => (
                <span
                  key={method}
                  className="rounded-lg border border-zinc-200 px-2.5 py-1 text-[10px] font-bold text-zinc-600"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-6 text-center text-2xl font-semibold text-zinc-900">
            Related Products
          </h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/nextshop/products/${p.id}`}
                className="group overflow-hidden rounded-[24px] border border-zinc-100 bg-white shadow-lg transition hover:-translate-y-1 hover:border-zinc-200"
              >
                <div className="relative aspect-square bg-zinc-100">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      sizes="25vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-zinc-400">
                      No image
                    </div>
                  )}
                  {p.featured && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-emerald-500">
                      Featured
                    </span>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-zinc-900 line-clamp-1">{p.name}</p>
                  <p className="mt-0.5 text-sm font-bold text-zinc-700">{formatPrice(p.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Zoomed image overlay */}
      {zoomed && validImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomed(false)}
        >
          <div className="relative h-[80vh] w-[80vw] max-w-3xl">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain"
              sizes="80vw"
            />
          </div>
        </div>
      )}
      </main>
      <Footer />
    </div>
  );
}
