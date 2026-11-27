import { notFound, permanentRedirect } from "next/navigation";
import { LEGACY_CATEGORY_PATHS } from "@/lib/product-categories";

export default async function CategoryPage({ params }: { params: Promise<{ section: string; subcategory: string }> }) {
  const { section, subcategory } = await params;
  const path = `${section}/${subcategory}`;
  if (!Object.hasOwn(LEGACY_CATEGORY_PATHS, path)) notFound();
  permanentRedirect(`/collection/${LEGACY_CATEGORY_PATHS[path]}`);
}
