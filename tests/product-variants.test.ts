import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { Prisma } from "@prisma/client";
import { variantConfigurationSchema } from "../src/lib/product-variants";
import { collapseLines, resolveCartLine } from "../src/lib/commerce/cart-lines";
import { createPendingOrder, releaseOrderInventory, CheckoutError } from "../src/lib/commerce/orders";
import { prisma } from "../src/lib/prisma";

const colors = [{ id: "black", name: "Black", swatch: "#000000", images: ["/black.jpg"] }];
const variants = [
  { id: "small", colorId: "black", size: "S", sku: "BLACK-S", price: null, inventory: 3, active: true },
  { id: "large", colorId: "black", size: "L", sku: "BLACK-L", price: 1500, inventory: 2, active: true },
];
const product = { id: "shirt", name: "Shirt", image: "/shirt.jpg", price: new Prisma.Decimal(1000), inventory: 5, hasVariants: true, colors, variants: variants.map((v) => ({ ...v, price: v.price === null ? null : new Prisma.Decimal(v.price) })) };
function transaction(t: TestContext, tx: object) {
  const original = prisma.$transaction;
  Reflect.set(prisma, "$transaction", (callback: (tx: object) => Promise<unknown>) => callback(tx));
  t.after(() => { Reflect.set(prisma, "$transaction", original); });
}
const checkout = { idempotencyKey: "variants-test", customerName: "Test", customerPhone: "+923001234567", shippingAddress: { line1: "Test Street", city: "Lahore", country: "PK" as const }, items: [{ productId: "shirt", variantId: "small", quantity: 2 }, { productId: "shirt", variantId: "large", quantity: 1 }] };

test("configuration rejects duplicate combinations, duplicate SKUs and missing colors", () => {
  const config = { hasVariants: true, colors, variants };
  assert.equal(variantConfigurationSchema.safeParse(config).success, true);
  assert.equal(variantConfigurationSchema.safeParse({ ...config, variants: [...variants, { ...variants[0], id: "duplicate", sku: "other" }] }).success, false);
  assert.equal(variantConfigurationSchema.safeParse({ ...config, variants: variants.map((v) => ({ ...v, sku: "same" })) }).success, false);
  assert.equal(variantConfigurationSchema.safeParse({ ...config, colors: [] }).success, false);
  assert.equal(variantConfigurationSchema.safeParse({ ...config, variants: [] }).success, false);
});

test("cart combines only identical variants and enforces the per-variant quantity limit", () => {
  assert.deepEqual(collapseLines([...checkout.items, checkout.items[0]]), [{ ...checkout.items[0], quantity: 4 }, checkout.items[1]]);
  assert.throws(() => collapseLines([{ ...checkout.items[0], quantity: 6 }, { ...checkout.items[0], quantity: 5 }]));
});

test("server resolves variant prices and color images, rejects missing, foreign and sold-out variants", () => {
  assert.equal(resolveCartLine(product, checkout.items[0]).price.toString(), "1000");
  assert.equal(resolveCartLine(product, checkout.items[1]).price.toString(), "1500");
  assert.equal(resolveCartLine(product, checkout.items[0]).image, "/black.jpg");
  for (const variantId of [undefined, "foreign"]) assert.throws(() => resolveCartLine(product, { productId: "shirt", quantity: 1, variantId }));
  assert.throws(() => resolveCartLine(product, { ...checkout.items[0], quantity: 4 }));
  assert.throws(() => resolveCartLine({ ...product, variants: product.variants.map((v) => ({ ...v, active: false })) }, checkout.items[0]));
  assert.throws(() => resolveCartLine({ ...product, hasVariants: false }, checkout.items[0]));
});

test("checkout reserves each variant atomically and snapshots its exact choices and price", async (t) => {
  const reservations: unknown[] = [];
  let saved: Prisma.OrderUncheckedCreateInput | undefined;
  transaction(t, {
    product: { findMany: async () => [product], updateMany: async () => ({ count: 1 }) },
    productVariant: { updateMany: async (args: unknown) => { reservations.push(args); return { count: 1 }; } },
    order: { create: async ({ data }: { data: Prisma.OrderUncheckedCreateInput }) => { saved = data; return { id: "order", orderNumber: "NS-TEST", totalMinor: data.totalMinor }; } },
    paymentAttempt: { create: async () => ({ id: "attempt" }) },
  });
  await createPendingOrder({ userId: "user", guestAccessHash: null }, "test@example.com", checkout);
  assert.equal(saved?.totalMinor, 350000);
  assert.deepEqual(reservations, checkout.items.map((line) => ({ where: { id: line.variantId, productId: "shirt", active: true, inventory: { gte: line.quantity } }, data: { inventory: { decrement: line.quantity } } })));
  const items = saved?.items?.create as Prisma.OrderItemUncheckedCreateWithoutOrderInput[];
  assert.deepEqual(items.map((item) => [item.variantId, item.color, item.size, item.sku, item.price.toString(), item.image]), [["small", "Black", "S", "BLACK-S", "1000", "/black.jpg"], ["large", "Black", "L", "BLACK-L", "1500", "/black.jpg"]]);
});

test("losing a race for the last variant prevents order creation", async (t) => {
  let created = false;
  transaction(t, { product: { findMany: async () => [product], updateMany: async () => ({ count: 1 }) }, productVariant: { updateMany: async () => ({ count: 0 }) }, order: { create: async () => { created = true; } } });
  await assert.rejects(createPendingOrder({ userId: "user", guestAccessHash: null }, "test@example.com", checkout), (error: unknown) => error instanceof CheckoutError && error.code === "OUT_OF_STOCK");
  assert.equal(created, false);
});

test("release restores the original variants once, including disabled variants without inflating catalog stock", async (t) => {
  let claimed = false;
  const restored: unknown[] = []; const aggregate: unknown[] = [];
  transaction(t, {
    order: { findUnique: async () => ({ items: checkout.items }), updateMany: async () => { if (claimed) return { count: 0 }; claimed = true; return { count: 1 }; } },
    product: { update: async () => ({}), updateMany: async (args: unknown) => { aggregate.push(args); return { count: 1 }; } },
    productVariant: { update: async (args: { where: { id: string } }) => { restored.push(args); return { active: args.where.id === "small" }; } },
  });
  assert.equal(await releaseOrderInventory("order"), true);
  assert.equal(await releaseOrderInventory("order"), false);
  assert.equal(restored.length, 2);
  assert.equal(aggregate.length, 1);
  assert.deepEqual(aggregate[0], { where: { id: "shirt", hasVariants: true }, data: { inventory: { increment: 2 } } });
});
