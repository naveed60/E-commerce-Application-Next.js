import { z } from "zod";

const image = z.string().trim().min(1).max(2048).refine((value) => {
  if (value.startsWith("/") && !value.startsWith("//")) return true;
  try { return ["http:", "https:"].includes(new URL(value).protocol); } catch { return false; }
}, "Use an image URL or a local path.");
export const variantFields = {
  hasVariants: z.boolean(),
  colors: z.array(z.object({
    id: z.string().min(1).max(128), name: z.string().trim().min(1).max(60),
    swatch: z.string().regex(/^#[0-9a-fA-F]{6}$/), images: z.array(image).max(12),
  })).max(30),
  variants: z.array(z.object({
    id: z.string().min(1).max(128), colorId: z.string().min(1).max(128).nullable(),
    size: z.string().trim().max(40), sku: z.string().trim().min(1).max(100),
    price: z.number().positive().max(10_000_000).refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 0.000001, "Use at most two decimal places.").nullable(), inventory: z.number().int().min(0).max(1_000_000), active: z.boolean(),
  })).max(300),
};
export const variantConfigurationSchema = z.object(variantFields).superRefine((data, ctx) => {
  const fail = (message: string) => ctx.addIssue({ code: "custom", message });
  if (data.hasVariants && !data.variants.some((v) => v.active)) fail("Enable at least one variant.");
  if (new Set(data.colors.map((c) => c.id)).size !== data.colors.length || new Set(data.colors.map((c) => c.name.toLowerCase())).size !== data.colors.length) fail("Colors must be unique.");
  if (new Set(data.variants.map((v) => v.id)).size !== data.variants.length) fail("Variant IDs must be unique.");
  const keys = new Set<string>(); const skus = new Set<string>();
  for (const v of data.variants) {
    if (v.active && v.colorId && !data.colors.some((c) => c.id === v.colorId)) fail("A variant references a missing color.");
    if (!v.colorId && !v.size) fail("Each variant needs a color or size.");
    const key = variantOptionKey(v);
    if (keys.has(key)) fail("Color and size combinations must be unique.");
    if (skus.has(v.sku.toLowerCase())) fail("SKUs must be unique.");
    keys.add(key); skus.add(v.sku.toLowerCase());
  }
});
export type VariantConfiguration = z.infer<typeof variantConfigurationSchema>;
export function variantOptionKey(v: { colorId: string | null; size: string }) {
  return JSON.stringify([v.colorId, v.size.trim().toLowerCase()]);
}
