import { notFound, redirect } from "next/navigation";
import { LEGACY_CATEGORIES } from "@/lib/product-categories";

const categories: Record<string, string> = {
  "men/un-stitch": "men-un-stitch",
  "men/stitch": "men-stitch",
  "men/watches": "men-watches",
  "men/perfumes": "men-perfumes",
  "men/cufflinks": "men-cufflinks",
  "women/un-stitch": "women-un-stitch",
  "women/stitch": "women-stitch",
  "women/watches": "women-watches",
  "women/perfumes": "women-perfumes",
  "women/cufflinks": "women-cufflinks",
  "kids/baby-boys-suits": "kids-baby-boys",
  "kids/baby-girls-suits": "kids-baby-girls",
};

export default async function CategoryPage({ params }: { params: Promise<{ section: string; subcategory: string }> }) {
  const { section, subcategory } = await params;
  const category = categories[`${section}/${subcategory}`];
  if (!category) notFound();
  redirect(`/collection/${LEGACY_CATEGORIES[category]}`);
}
