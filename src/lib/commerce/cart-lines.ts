import { Prisma } from "@prisma/client";
import { z } from "zod";

export const checkoutLineSchema = z.object({ productId: z.string().min(1).max(128), variantId: z.string().min(1).max(128).optional(), quantity: z.number().int().min(1).max(10) });
export type CheckoutLineInput = z.infer<typeof checkoutLineSchema>;
export function collapseLines(items: CheckoutLineInput[]): CheckoutLineInput[] {
  const lines = new Map<string, CheckoutLineInput>();
  for (const item of items) {
    const key = JSON.stringify([item.productId, item.variantId ?? null]);
    const existing = lines.get(key);
    lines.set(key, { ...item, quantity: (existing?.quantity ?? 0) + item.quantity });
  }
  if ([...lines.values()].some((line) => line.quantity > 10)) throw new Error("You can purchase a maximum of 10 units of each variant per order.");
  return [...lines.values()];
}

type PricedProduct = {
  id: string; name: string; image: string; price: Prisma.Decimal; inventory: number; hasVariants?: boolean;
  colors?: { id: string; name: string; images: string[] }[];
  variants?: { id: string; colorId: string | null; size: string; sku: string; price: Prisma.Decimal | null; inventory: number; active: boolean }[];
};
export function resolveCartLine(product: PricedProduct, line: CheckoutLineInput) {
  const variant = product.variants?.find((v) => v.id === line.variantId && v.active);
  if (product.hasVariants && !variant) throw new Error(`Select an available color and size for ${product.name}.`);
  if (!product.hasVariants && line.variantId) throw new Error(`${product.name} no longer offers this variant. Please add it again.`);
  const selected = product.hasVariants ? variant : undefined;
  const color = product.colors?.find((c) => c.id === selected?.colorId);
  if ((selected?.inventory ?? product.inventory) < line.quantity) throw new Error(`${product.name} is unavailable in the requested quantity.`);
  return { variant: selected, color, price: selected?.price ?? product.price, image: color?.images[0] ?? product.image };
}
