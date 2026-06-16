"use client";

import { ChangeEvent, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { PyramidLoader } from "@/components/ui/pyramid-loader";

import type { AdminProductFormInitialData } from "@/types/admin-product";

const PRODUCT_CATEGORIES = [
  { label: "Men — Un-Stitch", value: "men-un-stitch" },
  { label: "Men — Stitch", value: "men-stitch" },
  { label: "Men — Watches", value: "men-watches" },
  { label: "Men — Perfumes", value: "men-perfumes" },
  { label: "Men — Cufflinks", value: "men-cufflinks" },
  { label: "Women — Un-Stitch", value: "women-un-stitch" },
  { label: "Women — Stitch", value: "women-stitch" },
  { label: "Women — Watches", value: "women-watches" },
  { label: "Women — Perfumes", value: "women-perfumes" },
  { label: "Women — Cufflinks", value: "women-cufflinks" },
  { label: "Kids — Baby Boys Suits", value: "kids-baby-boys" },
  { label: "Kids — Baby Girls Suits", value: "kids-baby-girls" },
];

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: string;
  tags: string;
  inventory: string;
  rating: string;
  featured: boolean;
};

const defaultFormState: ProductFormState = {
  name: "",
  description: "",
  price: "0",
  image: "",
  category: "",
  tags: "",
  inventory: "25",
  rating: "4.5",
  featured: false,
};

const adminPageHeaderClass = "text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]";
const adminCardClass =
  "relative rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow)]";
const adminLabelClass = "space-y-1 text-sm font-medium text-[var(--admin-text-soft)]";
const adminFieldClass =
  "w-full rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none transition placeholder:text-[var(--admin-text-muted)] focus:border-[var(--admin-border-strong)] focus:ring-2 focus:ring-[var(--admin-ring)]";
const adminTextAreaClass = `${adminFieldClass} min-h-[120px]`;

function buildInitialState(initialData?: AdminProductFormInitialData): ProductFormState {
  if (!initialData) {
    return defaultFormState;
  }

  return {
    name: initialData.name,
    description: initialData.description,
    price: initialData.price.toString(),
    image: initialData.image,
    category: initialData.category,
    tags: initialData.tags.join(", "),
    inventory: initialData.inventory.toString(),
    rating: initialData.rating.toString(),
    featured: initialData.featured,
  };
}

export function AdminProductForm({
  mode,
  productId,
  initialData,
}: {
  mode: "create" | "edit";
  productId?: string;
  initialData?: AdminProductFormInitialData;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submittingProduct, setSubmittingProduct] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<ProductFormState>(() =>
    buildInitialState(initialData),
  );

  const formTitle = useMemo(
    () => (mode === "edit" ? "Update product" : "Add a new product"),
    [mode],
  );

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    setUploadError(null);
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message ?? "Unable to upload image");
      }

      setProductForm((prev) => ({
        ...prev,
        image: payload?.url ?? prev.image,
      }));
      toast.success("Image uploaded");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to upload image";
      setUploadError(message);
      toast.error(message);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClear = () => {
    setProductForm(buildInitialState(initialData));
    setUploadError(null);
  };

  return (
    <div className={adminCardClass}>
      {submittingProduct && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded-[28px] bg-[color-mix(in_srgb,var(--admin-bg-elevated)_72%,transparent)] backdrop-blur-[2px]">
          <PyramidLoader
            size="md"
            label={mode === "edit" ? "Updating product..." : "Saving product..."}
          />
        </div>
      )}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={adminPageHeaderClass}>Product catalog</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--admin-text)]">{formTitle}</h2>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleClear}
          className="border-[var(--admin-border)] bg-[var(--admin-bg-soft)] text-[var(--admin-text)] hover:bg-[var(--admin-bg-elevated)]"
        >
          Clear
        </Button>
      </div>

      <form
        className="mt-6 space-y-4"
        onSubmit={async (event) => {
          event.preventDefault();
          setSubmittingProduct(true);

          try {
            const tags = productForm.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean);

            const isEditing = mode === "edit";
            if (isEditing && !productId) {
              throw new Error("Missing product id");
            }

            const response = await fetch(
              isEditing ? `/api/admin/products/${productId}` : "/api/admin/products",
              {
                method: isEditing ? "PATCH" : "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: productForm.name,
                  description: productForm.description,
                  price: parseFloat(productForm.price),
                  image: productForm.image,
                  category: productForm.category,
                  tags,
                  inventory: Number(productForm.inventory),
                  featured: productForm.featured,
                  rating: parseFloat(productForm.rating),
                }),
              },
            );

            if (!response.ok) {
              const errorPayload = await response.json().catch(() => null);
              throw new Error(
                errorPayload?.message ??
                  (isEditing ? "Unable to update product" : "Unable to add product"),
              );
            }

            toast.success(isEditing ? "Product updated" : "Product added");
            router.push("/nextshop/admin/products");
            router.refresh();
          } catch (error) {
            toast.error(
              error instanceof Error ? error.message : "Unable to save product",
            );
          } finally {
            setSubmittingProduct(false);
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileUpload}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <label className={adminLabelClass}>
            Name
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(event) =>
                setProductForm((prev) => ({
                  ...prev,
                  name: event.target.value,
                }))
              }
              className={adminFieldClass}
            />
          </label>
          <label className={adminLabelClass}>
            Price
            <input
              type="number"
              min={0}
              step="0.01"
              required
              value={productForm.price}
              onChange={(event) =>
                setProductForm((prev) => ({
                  ...prev,
                  price: event.target.value,
                }))
              }
              className={adminFieldClass}
            />
          </label>
        </div>

        <label className={adminLabelClass}>
          Category <span className="text-rose-500">*</span>
          <select
            required
            value={productForm.category}
            onChange={(event) =>
              setProductForm((prev) => ({
                ...prev,
                category: event.target.value,
              }))
            }
            className={adminFieldClass}
          >
            <option value="" disabled>
              Select a category...
            </option>
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className={adminLabelClass}>
          Description
          <textarea
            required
            rows={3}
            value={productForm.description}
            onChange={(event) =>
              setProductForm((prev) => ({
                ...prev,
                description: event.target.value,
              }))
            }
            className={adminTextAreaClass}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className={adminLabelClass}>
            Image URL
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={productForm.image}
                  onChange={(event) =>
                    setProductForm((prev) => ({
                      ...prev,
                      image: event.target.value,
                    }))
                  }
                  className="flex-1 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-soft)] px-4 py-3 text-sm text-[var(--admin-text)] outline-none transition placeholder:text-[var(--admin-text-muted)] focus:border-[var(--admin-border-strong)] focus:ring-2 focus:ring-[var(--admin-ring)]"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="whitespace-nowrap border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text)] hover:bg-[var(--admin-bg-soft)]"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <span className="inline-flex items-center gap-2">
                      <PyramidLoader size="sm" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </div>
              {uploadError && (
                <p className="text-xs font-semibold text-rose-500">{uploadError}</p>
              )}
            </div>
          </label>

          <label className={adminLabelClass}>
            Inventory
            <input
              type="number"
              min={0}
              required
              value={productForm.inventory}
              onChange={(event) =>
                setProductForm((prev) => ({
                  ...prev,
                  inventory: event.target.value,
                }))
              }
              className={adminFieldClass}
            />
          </label>
        </div>

        <label className={adminLabelClass}>
          Tags (comma separated)
          <input
            type="text"
            value={productForm.tags}
            onChange={(event) =>
              setProductForm((prev) => ({
                ...prev,
                tags: event.target.value,
              }))
            }
            className={adminFieldClass}
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className={adminLabelClass}>
            Rating
            <input
              type="number"
              min={0}
              max={5}
              step="0.1"
              required
              value={productForm.rating}
              onChange={(event) =>
                setProductForm((prev) => ({
                  ...prev,
                  rating: event.target.value,
                }))
              }
              className={adminFieldClass}
            />
          </label>

          <label className="flex items-center gap-2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-soft)] px-4 py-3 text-sm font-medium text-[var(--admin-text-soft)]">
            <input
              type="checkbox"
              checked={productForm.featured}
              onChange={(event) =>
                setProductForm((prev) => ({
                  ...prev,
                  featured: event.target.checked,
                }))
              }
              className="h-4 w-4 rounded border border-[var(--admin-border)] accent-[var(--admin-accent)]"
            />
            Featured
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="submit"
            disabled={submittingProduct}
            className="min-w-32 bg-[var(--admin-accent)] text-white shadow-[0_10px_24px_var(--admin-ring)] hover:bg-[var(--admin-accent-strong)]"
          >
            {submittingProduct
              ? (
                <span className="inline-flex items-center gap-2">
                  <PyramidLoader size="sm" />
                  {mode === "edit" ? "Updating..." : "Saving..."}
                </span>
              )
              : mode === "edit"
              ? "Update product"
              : "Add product"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="bg-transparent text-[var(--admin-text)] hover:bg-[var(--admin-bg-soft)]"
            onClick={() => router.push("/nextshop/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
