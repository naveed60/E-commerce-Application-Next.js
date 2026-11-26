"use client";

import { useState } from "react";
import type { ProductColor, ProductVariant } from "@/types/product";
import { variantOptionKey } from "@/lib/product-variants";

export type VariantFormValue = { hasVariants: boolean; colors: ProductColor[]; variants: ProductVariant[] };
const field = "w-full rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg-soft)] px-3 py-2 text-sm text-[var(--admin-text)]";
const button = "rounded-xl border border-[var(--admin-border)] px-3 py-2 text-sm font-semibold";

export function ProductVariantEditor({ value, onChange, basePrice, onUploading, onPending }: { value: VariantFormValue; onChange: (value: VariantFormValue) => void; basePrice: number; onUploading: (uploading: boolean) => void; onPending: (pending: boolean) => void }) {
  const [sizes, setSizes] = useState(() => [...new Set(value.variants.filter((v) => v.active).map((v) => v.size).filter(Boolean))].join(", "));
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState<string | null>(null);
  const [bulkPrice, setBulkPrice] = useState("");
  const [bulkStock, setBulkStock] = useState("");
  const updateColor = (id: string, patch: Partial<ProductColor>) => onChange({ ...value, colors: value.colors.map((c) => c.id === id ? { ...c, ...patch } : c) });
  const updateVariant = (id: string, patch: Partial<ProductVariant>) => onChange({ ...value, variants: value.variants.map((v) => v.id === id ? { ...v, ...patch } : v) });

  function generate() {
    setError("");
    const selectedSizes = sizes.split(",").map((s) => s.trim()).filter(Boolean);
    if (new Set(selectedSizes.map((s) => s.toLowerCase())).size !== selectedSizes.length) return setError("Remove duplicate sizes.");
    if (!value.colors.length && !selectedSizes.length) return setError("Add at least one color or size.");
    if (value.colors.some((c) => !c.name.trim()) || new Set(value.colors.map((c) => c.name.trim().toLowerCase())).size !== value.colors.length) return setError("Enter a unique name for every color.");
    if (Math.max(1, value.colors.length) * Math.max(1, selectedSizes.length) > 300) return setError("Maximum 300 combinations per product.");
    const variants = value.variants.map((v) => ({ ...v, active: false }));
    for (const color of value.colors.length ? value.colors : [null]) for (const size of selectedSizes.length ? selectedSizes : [""]) {
      const key = variantOptionKey({ colorId: color?.id ?? null, size });
      const existing = variants.find((v) => variantOptionKey(v) === key);
      if (existing) existing.active = true;
      else variants.push({ id: crypto.randomUUID(), colorId: color?.id ?? null, size, sku: `SKU-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, price: null, inventory: 0, active: true });
    }
    onChange({ ...value, variants });
    onPending(false);
  }

  async function upload(color: ProductColor, files: FileList | null) {
    if (!files?.length) return;
    setError(""); setUploading(color.id); onUploading(true);
    try {
      if (color.images.length + files.length > 12) throw new Error("Maximum 12 photos per color.");
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData(); body.append("image", file);
        const response = await fetch("/api/admin/uploads", { method: "POST", body });
        const payload = await response.json();
        if (!response.ok || !payload.url) throw new Error(payload.message ?? "Unable to upload photo.");
        urls.push(payload.url);
      }
      updateColor(color.id, { images: [...color.images, ...urls] });
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to upload photos."); }
    finally { setUploading(null); onUploading(false); }
  }

  return <section className="space-y-4 rounded-2xl border border-[var(--admin-border)] p-4 text-[var(--admin-text)]">
    <h3 className="font-semibold">Colors &amp; sizes</h3>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={value.hasVariants} onChange={(e) => onChange({ ...value, hasVariants: e.target.checked })} />This product has different colors or sizes</label>
    {value.hasVariants && <>
      <p className="text-sm text-[var(--admin-text-muted)]">Add colors, enter sizes, then generate combinations. Blank variant prices use the product price.</p>
      {value.colors.map((color) => <div key={color.id} className="space-y-3 rounded-xl border border-[var(--admin-border)] p-3">
        <div className="flex flex-wrap items-end gap-3"><label className="min-w-40 flex-1 text-sm">Color name<input aria-label="Color name" required maxLength={60} className={field} value={color.name} onChange={(e) => updateColor(color.id, { name: e.target.value })} /></label><label className="text-sm">Swatch<input aria-label={`${color.name || "Color"} swatch`} className="block h-10 w-14" type="color" value={color.swatch} onChange={(e) => updateColor(color.id, { swatch: e.target.value })} /></label>
          <button type="button" className={button} onClick={() => { onChange({ ...value, colors: value.colors.filter((c) => c.id !== color.id), variants: value.variants.filter((v) => v.colorId !== color.id) }); onPending(true); }}>Remove color</button></div>
        <label className="block text-sm">Photo URLs (one per line; first photo is the cover)<textarea className={field} value={color.images.join("\n")} onChange={(e) => updateColor(color.id, { images: e.target.value.split("\n") })} /></label>
        <label className="block text-sm">Upload color photos<input className={`${field} mt-1`} type="file" accept="image/*" multiple disabled={uploading !== null} onChange={(e) => { void upload(color, e.target.files); e.target.value = ""; }} /></label>
        {uploading === color.id && <p role="status" className="text-sm">Uploading photos…</p>}
      </div>)}
      <button type="button" className={button} disabled={value.colors.length >= 30 || uploading !== null} onClick={() => { onChange({ ...value, colors: [...value.colors, { id: crypto.randomUUID(), name: "", swatch: "#000000", images: [] }] }); onPending(true); }}>Add color</button>
      <label className="block text-sm">Sizes (comma separated, in display order)<input className={field} value={sizes} placeholder="XS, S, M, L, XL — or 32, 34, Free Size" onChange={(e) => { setSizes(e.target.value); onPending(true); }} /></label>
      <button type="button" className={button} onClick={generate}>Generate / update combinations</button>
      <p className="text-xs text-[var(--admin-text-muted)]">Updating combinations preserves existing prices, stock and SKUs. Removed combinations are disabled and remain in order history.</p>
      {!!value.variants.length && <>
        <div className="flex flex-wrap items-end gap-2"><label className="text-sm">Price for enabled variants<input type="number" min="0.01" step="0.01" className={field} value={bulkPrice} onChange={(e) => setBulkPrice(e.target.value)} /></label><button className={button} type="button" disabled={!bulkPrice || Number(bulkPrice) <= 0} onClick={() => onChange({ ...value, variants: value.variants.map((v) => v.active ? { ...v, price: Number(bulkPrice) } : v) })}>Apply price</button><label className="text-sm">Stock for enabled variants<input type="number" min="0" step="1" className={field} value={bulkStock} onChange={(e) => setBulkStock(e.target.value)} /></label><button className={button} type="button" disabled={bulkStock === "" || !Number.isInteger(Number(bulkStock)) || Number(bulkStock) < 0} onClick={() => onChange({ ...value, variants: value.variants.map((v) => v.active ? { ...v, inventory: Number(bulkStock) } : v) })}>Apply stock</button></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{["Color", "Size", "SKU", "Price (PKR)", "Stock", "Enabled"].map((h) => <th key={h} className="p-2">{h}</th>)}</tr></thead><tbody>{value.variants.map((v) => <tr key={v.id} className={!v.active ? "opacity-60" : ""}><td className="p-2">{value.colors.find((c) => c.id === v.colorId)?.name || (v.colorId ? "Removed color" : "—")}</td><td className="p-2">{v.size || "—"}</td><td className="min-w-44 p-2"><input aria-label={`SKU ${v.size}`} className={field} required value={v.sku} onChange={(e) => updateVariant(v.id, { sku: e.target.value })} /></td><td className="min-w-32 p-2"><input aria-label={`Price ${v.sku}`} className={field} type="number" step="0.01" min="0.01" placeholder={String(basePrice)} value={v.price ?? ""} onChange={(e) => updateVariant(v.id, { price: e.target.value === "" ? null : Number(e.target.value) })} /></td><td className="min-w-24 p-2"><input aria-label={`Stock ${v.sku}`} className={field} type="number" required min="0" step="1" value={v.inventory} onChange={(e) => updateVariant(v.id, { inventory: Number(e.target.value) })} /></td><td className="p-2"><input aria-label={`Enable ${v.sku}`} type="checkbox" disabled={!!v.colorId && !value.colors.some((c) => c.id === v.colorId)} checked={v.active} onChange={(e) => updateVariant(v.id, { active: e.target.checked })} /></td></tr>)}</tbody></table></div>
        <p className="text-sm font-semibold">Total stock: {value.variants.reduce((sum, v) => sum + (v.active ? v.inventory : 0), 0)}</p>
      </>}
    </>}
    {error && <p role="alert" className="text-sm text-rose-500">{error}</p>}
  </section>;
}
