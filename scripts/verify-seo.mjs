import assert from "node:assert/strict";

const base = new URL(process.argv[2] || "http://127.0.0.1:3104");
const origin = new URL(process.env.SITE_URL || "https://my-store-next-js.vercel.app").origin;
const checks = [];

async function request(path) {
  const response = await fetch(new URL(path, base), {
    redirect: "manual", headers: { "User-Agent": "Googlebot", Accept: "text/html,application/xml;q=0.9,*/*;q=0.8" },
    signal: AbortSignal.timeout(60000),
  });
  return { response, html: await response.text() };
}
function canonical(html) {
  return html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1].replace(/&amp;/g, "&");
}
function schemas(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
}

const home = await request("/");
assert.equal(home.response.status, 200);
assert.equal(new URL(canonical(home.html)).href, `${origin}/`);
assert.ok(home.html.includes("Clothing &amp; Accessories Online in Pakistan"));
assert.ok(schemas(home.html).some((schema) => schema["@type"] === "OnlineStore"));
assert.ok(home.html.includes("/_next/image?"));
const homeProducts = new Set([...home.html.matchAll(/href="(\/products\/[^"?]+)"/g)].map((match) => match[1]));
assert.ok(homeProducts.size <= 12);
checks.push({ path: "/", status: 200, products: homeProducts.size, canonical: canonical(home.html) });

const shop = await request("/shop");
assert.equal(shop.response.status, 200);
assert.equal(canonical(shop.html), `${origin}/shop`);
assert.ok(shop.html.includes('action="/shop"'));
assert.ok([...shop.html.matchAll(/<article class="group">/g)].length <= 24);
checks.push({ path: "/shop", status: 200, canonical: canonical(shop.html) });

for (const path of ["/shop?q=seo-verification-no-match", "/shop?sort=low", "/shop?sort=high", "/login", "/checkout", "/checkout/return", "/info/track-order", "/categories/outdoor-edits"]) {
  const result = await request(path);
  assert.equal(result.response.status, 200, `${path} should render successfully`);
  assert.match(result.html, /<meta name="robots" content="[^"]*noindex/);
  if (path.startsWith("/shop")) assert.equal(canonical(result.html), `${origin}${path}`);
  if (path === "/shop?sort=low" || path === "/shop?sort=high") {
    const prices = [...result.html.matchAll(/<article class="group">([\s\S]*?)<\/article>/g)].map((article) => {
      const match = article[1].replace(/<!--.*?-->/g, "").match(/PKR ([\d,.]+)/);
      assert.ok(match, "Every product card should expose a price");
      return Number(match[1].replace(/,/g, ""));
    });
    for (let index = 1; index < prices.length; index++) assert.ok(path.endsWith("low") ? prices[index - 1] <= prices[index] : prices[index - 1] >= prices[index], "Prices must be sorted across the server-rendered page");
  }
  assert.ok(!result.html.includes("ShopKart"));
  checks.push({ path, status: result.response.status, noindex: true });
}

const nextPage = shop.html.match(/href="(\/shop\?page=2)"/)?.[1];
if (nextPage) {
  const result = await request(nextPage);
  assert.equal(result.response.status, 200);
  assert.equal(canonical(result.html), `${origin}${nextPage}`);
  assert.ok([...result.html.matchAll(/<article class="group">/g)].length <= 24);
  checks.push({ path: nextPage, status: 200, selfCanonical: true });
}

for (const [path, target] of [["/collection/men-un-stitch", "/collection/men"], ["/men/watches", "/collection/accessories"]]) {
  const result = await request(path);
  assert.equal(result.response.status, 308);
  assert.equal(new URL(result.response.headers.get("location"), base).pathname, target);
  checks.push({ path, status: 308, target });
}

const productPath = shop.html.match(/href="(\/products\/[^"?]+)"/)?.[1];
if (productPath) {
  const result = await request(productPath);
  assert.equal(result.response.status, 200);
  assert.equal(canonical(result.html), `${origin}${productPath}`);
  const data = schemas(result.html);
  const product = data.find((schema) => ["Product", "ProductGroup"].includes(schema["@type"]));
  assert.ok(product);
  assert.ok(data.some((schema) => schema["@type"] === "BreadcrumbList"));
  if (result.html.includes("No reviews yet")) assert.equal("aggregateRating" in product, false);
  if (product["@type"] === "ProductGroup") {
    const variant = new URL(product.hasVariant[0].url);
    const selected = await request(`${variant.pathname}${variant.search}`);
    assert.equal(selected.response.status, 200);
    assert.equal(canonical(selected.html), `${origin}${productPath}`);
    assert.ok(selected.html.replace(/<!--.*?-->/g, "").includes(`SKU: ${product.hasVariant[0].sku}</p>`), "The variant URL should restore the selected SKU in the visible page");
    checks.push({ path: `${variant.pathname}${variant.search}`, status: 200, parentCanonical: true });
  }
  checks.push({ path: productPath, status: 200, schema: product["@type"] });
}

for (const path of ["/products/seo-verification-missing-product", "/shop?page=999999"]) {
  const result = await request(path);
  assert.equal(result.response.status, 404, `${path} should return an HTTP 404`);
  assert.match(result.html, /<meta name="robots" content="[^"]*noindex/);
  checks.push({ path, status: result.response.status, noindex: true });
}

const robots = await request("/robots.txt");
assert.equal(robots.response.status, 200);
assert.ok(robots.html.includes(`Sitemap: ${origin}/sitemap-index.xml`));
assert.ok(robots.html.includes("Allow: /"));
checks.push({ path: "/robots.txt", status: 200 });

for (const path of ["/sitemap-index.xml", "/sitemap.xml", "/products/sitemap/0.xml"]) {
  const result = await request(path);
  assert.equal(result.response.status, 200);
  assert.ok(result.response.headers.get("content-type").includes("xml"));
  assert.ok(result.html.includes(origin));
  assert.ok(!/localhost|\/checkout|\/admin|\/login|track-order|outdoor-edits/.test(result.html));
  checks.push({ path, status: 200, locations: [...result.html.matchAll(/<loc>/g)].length });
}

const social = await fetch(new URL("/social-image", base));
assert.equal(social.status, 200);
assert.match(social.headers.get("content-type"), /image\/png/);
checks.push({ path: "/social-image", status: 200, contentType: "image/png" });

const admin = await request("/admin");
assert.equal(admin.response.headers.get("x-robots-tag"), "noindex, nofollow");
checks.push({ path: "/admin", status: admin.response.status, robotsHeader: true });

console.log(JSON.stringify({ passed: checks.length, checks }, null, 2));
