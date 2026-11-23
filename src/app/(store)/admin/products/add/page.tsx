import { AdminProductForm } from "@/components/admin/admin-product-form";

export default function AdminAddProductPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]">
          Catalog
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
          Add product
        </h1>
      </div>

      <AdminProductForm mode="create" />
    </div>
  );
}
