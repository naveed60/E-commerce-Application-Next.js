import assert from "node:assert/strict";
import test, { type TestContext } from "node:test";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/lib/prisma";
import { getCatalog, getHomeProducts } from "../src/lib/catalog";

function replace(t: TestContext, target: object, name: string, value: unknown) {
  const previous = Reflect.get(target, name);
  Reflect.set(target, name, value);
  t.after(() => { Reflect.set(target, name, previous); });
}
const row = {
  id: "shirt", name: "Shirt", description: "Cotton shirt", price: new Prisma.Decimal(1000), image: "/shirt.jpg",
  tags: [], featured: false, category: "men", inventory: 99, hasVariants: true, createdAt: new Date("2026-11-26T00:00:00Z"),
  variants: [{ price: new Prisma.Decimal(1800), inventory: 3 }, { price: new Prisma.Decimal(2200), inventory: 0 }],
};

test("homepage caps its query and derives variant pricing, stock and real review aggregates", async (t) => {
  let requested: Prisma.ProductFindManyArgs | undefined;
  replace(t, prisma.product, "findMany", async (args: Prisma.ProductFindManyArgs) => { requested = args; return [row]; });
  replace(t, prisma.productReview, "groupBy", async () => [{ productId: row.id, _avg: { rating: 4.2 }, _count: { rating: 5 } }]);
  const [product] = await getHomeProducts();
  assert.equal(requested?.take, 12);
  assert.deepEqual(requested?.where, { archived: false });
  assert.equal(product.price, 1800);
  assert.equal(product.inventory, 3);
  assert.equal(product.rating, 4.2);
  assert.equal(product.reviewCount, 5);
});

test("unreviewed products do not inherit the editable legacy star rating", async (t) => {
  replace(t, prisma.product, "findMany", async () => [{ ...row, rating: 4.5 }]);
  replace(t, prisma.productReview, "groupBy", async () => []);
  const [product] = await getHomeProducts();
  assert.equal(product.rating, 0);
  assert.equal(product.reviewCount, 0);
});

test("catalog queries fetch one page and preserve category and literal search filters", async (t) => {
  let requested: Prisma.ProductFindManyArgs | undefined;
  replace(t, prisma.product, "count", async () => 49);
  replace(t, prisma.product, "findMany", async (args: Prisma.ProductFindManyArgs) => { requested = args; return []; });
  const catalog = await getCatalog("men", 2, "50%", "latest");
  assert.equal(catalog.pages, 3);
  assert.equal(catalog.total, 49);
  assert.equal(requested?.take, 24);
  assert.equal(requested?.skip, 24);
  assert.equal(requested?.where?.category, "men");
  assert.equal(requested?.where?.archived, false);
  assert.deepEqual(requested?.where?.OR?.[0], { name: { contains: "50\\%", mode: "insensitive" } });
});

test("first latest catalog page overlaps the count and product queries", async (t) => {
  let productQueryStarted = false;
  replace(t, prisma.product, "count", async () => {
    await Promise.resolve();
    assert.equal(productQueryStarted, true);
    return 1;
  });
  replace(t, prisma.product, "findMany", async () => {
    productQueryStarted = true;
    return [row];
  });
  replace(t, prisma.productReview, "groupBy", async () => []);

  const catalog = await getCatalog(undefined, 1, "", "latest");

  assert.equal(catalog.total, 1);
  assert.equal(catalog.products.length, 1);
});

test("out-of-range pagination stops before running a deep-offset product query", async (t) => {
  replace(t, prisma.product, "count", async () => 5);
  replace(t, prisma.product, "findMany", async () => { throw new Error("Must not fetch an out-of-range page"); });
  assert.deepEqual(await getCatalog(undefined, 999999, "", "latest"), { products: [], total: 5, pages: 1 });
});

test("price sorting preserves database rank and parameterizes shopper input", async (t) => {
  const q = "' OR 1=1 --";
  let query: Prisma.Sql | undefined;
  replace(t, prisma.product, "count", async () => 2);
  replace(t, prisma, "$queryRaw", async (sql: Prisma.Sql) => { query = sql; return [{ id: "other" }, { id: row.id }]; });
  replace(t, prisma.product, "findMany", async () => [row, { ...row, id: "other" }]);
  replace(t, prisma.productReview, "groupBy", async () => []);
  const catalog = await getCatalog("men", 1, q, "low");
  assert.deepEqual(catalog.products.map((p) => p.id), ["other", "shirt"]);
  assert.ok(query?.values.includes(q));
  assert.equal(query?.strings.join("").includes(q), false);
  assert.ok(query?.strings.join("").includes("MIN(COALESCE(v.price, p.price)::numeric)"));
});
