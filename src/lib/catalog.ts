import { cache } from "react";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CATALOG_PAGE_SIZE, HOME_PRODUCT_LIMIT } from "./catalog-params";
import type { StorefrontProduct } from "@/types/product";

const cardSelect = {
  id: true, name: true, description: true, price: true, image: true, tags: true,
  featured: true, category: true, hasVariants: true, inventory: true, createdAt: true,
  variants: { where: { active: true }, select: { price: true, inventory: true } },
} satisfies Prisma.ProductSelect;

type CardProduct = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

function catalogWhere(category: string | undefined, q: string): Prisma.ProductWhereInput {
  const escapedQuery = q.replace(/[\\%_]/g, "\\$&");
  return {
    archived: false,
    ...(category ? { category } : {}),
    ...(q ? {
      OR: [
        { name: { contains: escapedQuery, mode: "insensitive" } },
        { description: { contains: escapedQuery, mode: "insensitive" } },
        { tags: { has: q } },
      ],
    } : {}),
  };
}

async function serializeCards(products: CardProduct[]): Promise<StorefrontProduct[]> {
  if (!products.length) return [];
  const ratings = await prisma.productReview.groupBy({
    by: ["productId"], where: { visible: true, productId: { in: products.map((p) => p.id) } },
    _avg: { rating: true }, _count: { rating: true },
  });
  const summaries = new Map(ratings.map((r) => [r.productId, r]));
  return products.map((p) => {
    const summary = summaries.get(p.id);
    const prices = p.hasVariants ? p.variants.map((v) => Number(v.price ?? p.price)) : [];
    return {
      id: p.id, name: p.name, description: p.description, price: prices.length ? Math.min(...prices) : Number(p.price),
      image: p.image, tags: p.tags, featured: p.featured, category: p.category,
      hasVariants: p.hasVariants,
      inventory: p.hasVariants ? p.variants.reduce((sum, v) => sum + v.inventory, 0) : p.inventory,
      rating: summary?._avg.rating ?? 0, reviewCount: summary?._count.rating ?? 0,
      createdAt: p.createdAt.toISOString(),
    };
  });
}

// Request memoization shares Prisma reads between metadata and page rendering.
// Stock and prices remain fresh across requests; checkout still validates both.
export const getHomeProducts = cache(async () => serializeCards(await prisma.product.findMany({
  where: { archived: false }, select: cardSelect, take: HOME_PRODUCT_LIMIT,
  orderBy: [{ createdAt: "desc" }, { id: "desc" }],
})));

export const getCatalogTotal = cache(async (category: string | undefined, q: string) =>
  prisma.product.count({ where: catalogWhere(category, q) }),
);

export const getCatalog = cache(async (category: string | undefined, page: number, q: string, sort: string) => {
  const escapedQuery = q.replace(/[\\%_]/g, "\\$&");
  const where = catalogWhere(category, q);
  const totalPromise = getCatalogTotal(category, q);
  let total: number;
  let pages: number;
  let products: CardProduct[];
  if (page === 1 && sort !== "low" && sort !== "high") {
    const [count, rows] = await Promise.all([
      totalPromise,
      prisma.product.findMany({
        where, select: cardSelect, take: CATALOG_PAGE_SIZE,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      }),
    ]);
    total = count;
    pages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
    products = rows;
  } else {
    total = await totalPromise;
    pages = Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE));
    if (page > pages) return { products: [], total, pages };
    if (sort === "low" || sort === "high") {
      // Sort by the same starting price shown on cards, including variant overrides.
      // Only the fixed direction is SQL text; all shopper input is parameterized.
      const direction = sort === "low" ? Prisma.sql`ASC` : Prisma.sql`DESC`;
      const pattern = `%${escapedQuery}%`;
      const ranked = await prisma.$queryRaw<{ id: string }[]>(Prisma.sql`
        SELECT p.id FROM "Product" p
        LEFT JOIN LATERAL (
          SELECT MIN(COALESCE(v.price, p.price)::numeric) AS price
          FROM "ProductVariant" v WHERE v."productId" = p.id AND v.active = true
        ) variant_price ON p."hasVariants" = true
        WHERE p.archived = false
          ${category ? Prisma.sql`AND p.category = ${category}` : Prisma.empty}
          ${q ? Prisma.sql`AND (p.name ILIKE ${pattern} OR p.description ILIKE ${pattern} OR ${q} = ANY(p.tags))` : Prisma.empty}
        ORDER BY CASE WHEN p."hasVariants" THEN COALESCE(variant_price.price, p.price::numeric) ELSE p.price::numeric END ${direction}, p.id ASC
        LIMIT ${CATALOG_PAGE_SIZE} OFFSET ${(page - 1) * CATALOG_PAGE_SIZE}
      `);
      const rows = await prisma.product.findMany({ where: { ...where, id: { in: ranked.map((p) => p.id) } }, select: cardSelect });
      const byId = new Map(rows.map((p) => [p.id, p]));
      products = ranked.flatMap((p) => { const row = byId.get(p.id); return row ? [row] : []; });
    } else {
      products = await prisma.product.findMany({ where, select: cardSelect, take: CATALOG_PAGE_SIZE, skip: (page - 1) * CATALOG_PAGE_SIZE,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      });
    }
  }
  return { products: await serializeCards(products), total, pages };
});

export const getProduct = cache(async (id: string) => prisma.product.findUnique({
  where: { id, archived: false },
  include: { colors: { where: { active: true }, orderBy: { position: "asc" } }, variants: { where: { active: true }, orderBy: { position: "asc" } } },
}));

export const getProductRating = cache(async (productId: string) => {
  const result = await prisma.productReview.aggregate({ where: { productId, visible: true }, _avg: { rating: true }, _count: { rating: true } });
  return { rating: result._avg.rating ?? 0, reviewCount: result._count.rating };
});

export const getRelatedProducts = cache(async (productId: string, category: string) => serializeCards(await prisma.product.findMany({
  where: { category, archived: false, NOT: { id: productId } }, select: cardSelect,
  take: 4, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
})));
