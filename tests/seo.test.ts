import assert from "node:assert/strict";
import test from "node:test";
import { absoluteUrl, breadcrumbData, getSiteUrl, indexingEnabled, pageMetadata, productPath, serializeJsonLd } from "../src/lib/seo";
import { catalogParams, catalogPath } from "../src/lib/catalog-params";
import { productStructuredData } from "../src/lib/product-seo";
import { getValidImageUrl } from "../src/lib/utils";
import type { StorefrontProduct } from "../src/types/product";

const product: StorefrontProduct = {
  id: "shirt", name: "Cotton Shirt", description: "A cotton shirt.", price: 1200, image: "/uploads/shirt.jpg", tags: [],
  rating: 4.5, reviewCount: 0, inventory: 3, featured: false, category: "men", createdAt: "2026-11-26T00:00:00Z",
};

test("public SEO URLs use the confirmed domain independently of local checkout URLs", (t) => {
  const saved = process.env.SITE_URL;
  delete process.env.SITE_URL;
  t.after(() => { if (saved === undefined) delete process.env.SITE_URL; else process.env.SITE_URL = saved; });
  assert.equal(getSiteUrl().origin, "https://my-store-next-js.vercel.app");
  assert.equal(absoluteUrl(productPath("a/b")), "https://my-store-next-js.vercel.app/products/a%2Fb");
});

test("indexing excludes development, preview, localhost and explicit staging environments", (t) => {
  const keys = ["NODE_ENV", "SITE_URL", "VERCEL_ENV", "INDEXING_ENABLED"];
  const saved = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  t.after(() => { for (const key of keys) { if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key]; } });
  Reflect.set(process.env, "NODE_ENV", "production");
  process.env.SITE_URL = "https://shop.example.com";
  delete process.env.VERCEL_ENV;
  delete process.env.INDEXING_ENABLED;
  assert.equal(indexingEnabled(), true);
  process.env.VERCEL_ENV = "preview";
  assert.equal(indexingEnabled(), false);
  delete process.env.VERCEL_ENV;
  process.env.INDEXING_ENABLED = "false";
  assert.equal(indexingEnabled(), false);
  delete process.env.INDEXING_ENABLED;
  process.env.SITE_URL = "http://localhost:3000";
  assert.equal(indexingEnabled(), false);
  process.env.SITE_URL = "https://shop.example.com";
  Reflect.set(process.env, "NODE_ENV", "development");
  assert.equal(indexingEnabled(), false);
});

test("metadata gives paginated pages distinct canonicals and utility pages noindex", () => {
  const metadata = pageMetadata({ title: "Men — Page 2", description: "Clothing", path: "/collection/men?page=2", noIndex: true });
  assert.equal(metadata.alternates?.canonical, absoluteUrl("/collection/men?page=2"));
  assert.deepEqual(metadata.robots, { index: false, follow: true });
  assert.ok(metadata.openGraph);
  assert.ok(metadata.twitter);
});

test("catalog parameters bound search and reject malformed or excessive page numbers", () => {
  assert.deepEqual(catalogParams({ page: "2", q: " shirt ", sort: "low" }), { page: 2, q: "shirt", sort: "low" });
  for (const page of ["-1", "0", "1.5", "Infinity", "9999999", "2oops"]) assert.equal(catalogParams({ page }).page, 1);
  assert.equal(catalogParams({ q: "x".repeat(500) }).q.length, 100);
  assert.deepEqual(catalogParams({ q: ["a", "b"], sort: "malicious" }), { page: 1, q: "", sort: "latest" });
});

test("pagination keeps filters, encodes input and omits default parameters", () => {
  assert.equal(catalogPath("/shop", { page: 1 }), "/shop");
  assert.equal(catalogPath("/shop", { page: 3, q: "shirt & suit", sort: "high" }), "/shop?q=shirt+%26+suit&sort=high&page=3");
});

test("JSON-LD cannot break out of its script element", () => {
  const serialized = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
  assert.equal(serialized.includes("<"), false);
  assert.equal(JSON.parse(serialized).name, "</script><script>alert(1)</script>");
});

test("default or editable product ratings are omitted when there are no published reviews", () => {
  const schema = productStructuredData(product);
  assert.equal("aggregateRating" in schema, false);
  assert.equal(schema["@type"], "Product");
  assert.equal(schema.image[0], absoluteUrl(product.image));
  assert.ok("offers" in schema);
  if ("offers" in schema) {
    assert.equal(schema.offers.price, "1200.00");
    assert.equal(schema.offers.priceCurrency, "PKR");
    assert.equal(schema.offers.availability, "https://schema.org/InStock");
  }
});

test("real review aggregates and sold-out status are accurately represented", () => {
  const schema = productStructuredData({ ...product, reviewCount: 7, rating: 4.285714, inventory: 0 });
  assert.deepEqual(schema.aggregateRating, { "@type": "AggregateRating", ratingValue: 4.3, reviewCount: 7, bestRating: 5, worstRating: 1 });
  if ("offers" in schema) assert.equal(schema.offers.availability, "https://schema.org/OutOfStock");
});

test("variant offers have selectable URLs, their own stock, prices and color images", () => {
  const schema = productStructuredData({ ...product, hasVariants: true,
    colors: [{ id: "blue", name: "Blue", swatch: "#0000ff", images: ["/blue.jpg"] }],
    variants: [
      { id: "small", colorId: "blue", size: "S", sku: "BLUE-S", price: null, inventory: 0, active: true },
      { id: "large", colorId: "blue", size: "L", sku: "BLUE-L", price: 1500, inventory: 2, active: true },
      { id: "hidden", colorId: "blue", size: "XL", sku: "BLUE-XL", price: 100, inventory: 5, active: false },
    ],
  });
  assert.equal(schema["@type"], "ProductGroup");
  assert.ok("hasVariant" in schema);
  if (!("hasVariant" in schema)) return;
  assert.equal(schema.hasVariant.length, 2);
  assert.deepEqual(schema.variesBy, ["https://schema.org/color", "https://schema.org/size"]);
  assert.equal(schema.hasVariant[0].offers.price, "1200.00");
  assert.equal(schema.hasVariant[0].offers.availability, "https://schema.org/OutOfStock");
  assert.equal(schema.hasVariant[1].offers.price, "1500.00");
  assert.equal(schema.hasVariant[1].offers.availability, "https://schema.org/InStock");
  assert.equal(schema.hasVariant[1].url, absoluteUrl("/products/shirt?variant=large"));
  assert.equal(schema.hasVariant[1].image[0], absoluteUrl("/blue.jpg"));
  assert.equal(schema.hasVariant[1].sku, "BLUE-L");
});

test("image validation rejects unsafe URLs and accepts the optimizer's configured hosts", () => {
  for (const src of ["//evil.example/a.jpg", "/\\evil.example/a.jpg", "javascript:alert(1)", "https://evil.example/a.jpg", "http://images.unsplash.com/a.jpg", "https://images.unsplash.com:8443/a.jpg"]) assert.equal(getValidImageUrl(src), null);
  for (const src of ["/uploads/a.jpg", "https://images.unsplash.com/a.jpg", "https://nov-minicom.myshopify.com/a.jpg", "https://store.public.blob.vercel-storage.com/a.jpg"]) assert.equal(getValidImageUrl(src), src);
});

test("breadcrumbs have ordered positions and absolute item URLs", () => {
  const schema = breadcrumbData([{ name: "Home", path: "/" }, { name: "Men", path: "/collection/men" }]);
  assert.deepEqual(schema.itemListElement.map((item) => item.position), [1, 2]);
  assert.equal(schema.itemListElement[1].item, absoluteUrl("/collection/men"));
});
