"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Eye, PencilLine, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PyramidLoader } from "@/components/ui/pyramid-loader";

import type { AdminProductSummary } from "@/types/admin-product";

const iconButtonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text)] transition hover:border-[var(--admin-border-strong)] hover:bg-[var(--admin-bg-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--admin-accent)]";
const iconDangerButtonClass =
  "inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-500/25 bg-[var(--admin-bg-elevated)] text-rose-500 transition hover:border-rose-500/50 hover:bg-rose-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500";

export function AdminProductsBoard() {
  const [catalog, setCatalog] = useState<AdminProductSummary[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [viewingProduct, setViewingProduct] = useState<AdminProductSummary | null>(
    null,
  );
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const refreshProducts = useCallback(async () => {
    setLoadingProducts(true);

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to load products");
      }

      setCatalog(payload?.products ?? []);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to load products",
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const handleDeleteProduct = async (product: AdminProductSummary) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) {
      return;
    }

    setDeletingProductId(product.id);

    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to delete product");
      }

      toast.success("Product deleted");
      await refreshProducts();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to delete product",
      );
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]">
            Catalog
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
            Products
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshProducts}
            className="border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text)] hover:bg-[var(--admin-bg-soft)]"
          >
            Refresh
          </Button>
          <Link
            href="/nextshop/admin/products/add"
            className="inline-flex items-center justify-center rounded-full bg-[var(--admin-accent)] px-4 py-2 text-sm font-medium text-white shadow-[0_10px_24px_var(--admin-ring)] transition hover:bg-[var(--admin-accent-strong)]"
          >
            Add product
          </Link>
        </div>
      </div>

      <section className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[var(--admin-text-soft)]">All products</p>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--admin-text-muted)]">
            {catalog.length} total
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {loadingProducts ? (
            <div className="flex justify-center py-8">
              <PyramidLoader size="md" label="Loading products..." />
            </div>
          ) : catalog.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[var(--admin-border)] bg-[var(--admin-bg-soft)] p-6">
              <p className="text-sm text-[var(--admin-text-soft)]">No products found.</p>
              <Link
                href="/nextshop/admin/products/add"
                className="mt-3 inline-flex text-sm font-semibold text-[var(--admin-accent)]"
              >
                Add your first product
              </Link>
            </div>
          ) : (
            catalog.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 rounded-[24px] border border-[var(--admin-border)] bg-[var(--admin-bg-soft)] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 lg:flex-1">
                  <p className="truncate text-sm font-semibold text-[var(--admin-text)]">{product.name}</p>
                  <p className="line-clamp-2 text-xs text-[var(--admin-text-soft)]">{product.description}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[var(--admin-text-soft)]">
                    <span>{product.priceLabel}</span>
                    <span>{product.inventory} in stock</span>
                    <span>Rating {product.rating.toFixed(1)}</span>
                    {product.featured && (
                      <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-500">
                        Featured
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setViewingProduct(product)}
                    className={iconButtonClass}
                    aria-label={`View ${product.name}`}
                    title={`View ${product.name}`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <Link
                    href={`/nextshop/admin/products/${product.id}/edit`}
                    className={iconButtonClass}
                    aria-label={`Edit ${product.name}`}
                    title={`Edit ${product.name}`}
                  >
                    <PencilLine className="h-4 w-4" />
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={iconDangerButtonClass}
                    disabled={deletingProductId === product.id}
                    onClick={() => handleDeleteProduct(product)}
                    aria-label={`Delete ${product.name}`}
                    title={`Delete ${product.name}`}
                  >
                    {deletingProductId === product.id ? (
                      <span className="inline-flex items-center gap-2">
                        <PyramidLoader size="xs" />
                      </span>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {viewingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 px-4 py-10 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[0_24px_60px_rgba(15,23,42,0.28)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[var(--admin-text-muted)]">Product preview</p>
                <h3 className="text-xl font-semibold tracking-tight text-[var(--admin-text)]">{viewingProduct.name}</h3>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setViewingProduct(null)}
                className="bg-transparent text-[var(--admin-text)] hover:bg-[var(--admin-bg-soft)]"
              >
                Close
              </Button>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-[var(--admin-bg-soft)]">
                {viewingProduct.image ? (
                  // Next/Image is not suitable here because URLs can be arbitrary admin-provided links.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={viewingProduct.image}
                    alt={viewingProduct.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.3em] text-[var(--admin-text-muted)]">
                    No image
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm text-[var(--admin-text-soft)]">
                <p>{viewingProduct.description}</p>
                <p>Price: {viewingProduct.priceLabel}</p>
                <p>Inventory: {viewingProduct.inventory}</p>
                <p>Rating: {viewingProduct.rating.toFixed(1)}</p>
                <div className="flex flex-wrap gap-2">
                  {viewingProduct.tags.map((tag) => (
                    <span
                      key={`${viewingProduct.id}-${tag}-preview`}
                      className="rounded-full border border-[var(--admin-border)] px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-[var(--admin-text)]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
