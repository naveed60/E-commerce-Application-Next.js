import { Prisma } from "@prisma/client";
import { variantConfigurationSchema, variantOptionKey } from "./product-variants";

// Call after updating the product in the same transaction, so checkout and edits serialize.
export async function saveProductVariants(tx: Prisma.TransactionClient, productId: string, input: unknown) {
  const config = variantConfigurationSchema.parse(input);
  const existingColors = await tx.productColor.findMany({ where: { productId } });
  const existingVariants = await tx.productVariant.findMany({ where: { productId } });
  await tx.productColor.updateMany({ where: { productId, id: { notIn: config.colors.map((c) => c.id) } }, data: { active: false } });
  const newColors: Prisma.ProductColorCreateManyInput[] = [];
  for (const [position, color] of config.colors.entries()) {
    const owned = existingColors.find((c) => c.id === color.id);
    const data = { name: color.name, swatch: color.swatch, images: color.images, position, active: true };
    if (!owned) newColors.push({ ...data, id: color.id, productId });
    else if (!owned.active || owned.position !== position || owned.name !== color.name || owned.swatch !== color.swatch || JSON.stringify(owned.images) !== JSON.stringify(color.images)) {
      await tx.productColor.update({ where: { id: owned.id }, data });
    }
  }
  if (newColors.length) await tx.productColor.createMany({ data: newColors });
  // Preserve IDs and references in carts/orders, including disabled combinations.
  await tx.productVariant.updateMany({ where: { productId, id: { notIn: config.variants.map((v) => v.id) } }, data: { active: false } });
  const newVariants: Prisma.ProductVariantCreateManyInput[] = [];
  for (const [position, variant] of config.variants.entries()) {
    const optionKey = variantOptionKey(variant);
    const owned = existingVariants.find((v) => v.id === variant.id);
    if (owned && owned.optionKey !== optionKey) throw new Error("An existing variant's color and size cannot be changed. Add a new combination instead.");
    const data = { colorId: variant.colorId, size: variant.size, optionKey, sku: variant.sku, price: variant.price, inventory: variant.inventory, active: config.hasVariants && variant.active, position };
    if (!owned) newVariants.push({ ...data, id: variant.id, productId });
    else if (owned.sku !== data.sku || owned.price?.toString() !== (data.price === null ? undefined : String(data.price)) || owned.inventory !== data.inventory || owned.active !== data.active || owned.position !== position || owned.size !== data.size) {
      await tx.productVariant.update({ where: { id: owned.id }, data });
    }
  }
  if (newVariants.length) await tx.productVariant.createMany({ data: newVariants });
  if (config.hasVariants) {
    const stock = await tx.productVariant.aggregate({ where: { productId, active: true }, _sum: { inventory: true } });
    await tx.product.update({ where: { id: productId }, data: { inventory: stock._sum.inventory ?? 0 } });
  }
}
