import { LandingScreen } from "@/components/landing/landing-screen";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NextShopPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  let databaseUnavailable = false;

  try {
    products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    databaseUnavailable = true;
    console.error("[storefront] Unable to load products from the database.", error);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const serializedProducts = products.map((product: any) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    image: product.image,
    tags: product.tags,
    rating: product.rating,
    featured: product.featured,
    category: product.category ?? "",
    createdAt: product.createdAt.toISOString(),
  }));

  return (
    <LandingScreen
      products={serializedProducts}
      databaseUnavailable={databaseUnavailable}
    />
  );
}
