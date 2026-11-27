export const PRODUCT_CATEGORIES = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
  { value: "accessories", label: "Accessories" },
] as const;

export const PRODUCT_CATEGORY_VALUES = ["men", "women", "kids", "accessories"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORY_VALUES)[number];

export const CATEGORY_CONTENT: Record<ProductCategory, { title: string; description: string }> = {
  men: { title: "Men’s Clothing", description: "Explore men’s clothing at Drape & Line. Compare available styles, sizes and colours, check current prices in PKR, and find pieces for your everyday wardrobe." },
  women: { title: "Women’s Clothing", description: "Discover women’s clothing at Drape & Line. Browse the latest available styles, explore colour and size options, and choose clothing for everyday dressing and special moments." },
  kids: { title: "Kids’ Clothing", description: "Browse kids’ clothing at Drape & Line. Check individual product details, available sizes and current stock to find clothing for little ones and growing wardrobes." },
  accessories: { title: "Accessories", description: "Discover accessories at Drape & Line. Explore the current collection, compare product details and prices in PKR, and find finishing touches for your wardrobe." },
};

export function isProductCategory(value: string): value is ProductCategory {
  return PRODUCT_CATEGORY_VALUES.some((category) => category === value);
}

export function categoryLabel(value: string): string {
  return PRODUCT_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}

// Preserve links to categories used before the Drape & Line storefront.
export const LEGACY_CATEGORIES: Record<string, ProductCategory> = {
  "men-un-stitch": "men", "men-stitch": "men", "women-un-stitch": "women", "women-stitch": "women",
  "kids-baby-boys": "kids", "kids-baby-girls": "kids",
  "men-watches": "accessories", "men-perfumes": "accessories", "men-cufflinks": "accessories",
  "women-watches": "accessories", "women-perfumes": "accessories", "women-cufflinks": "accessories",
};

export const LEGACY_CATEGORY_PATHS: Record<string, ProductCategory> = {
  "men/un-stitch": "men", "men/stitch": "men", "women/un-stitch": "women", "women/stitch": "women",
  "kids/baby-boys-suits": "kids", "kids/baby-girls-suits": "kids",
  "men/watches": "accessories", "men/perfumes": "accessories", "men/cufflinks": "accessories",
  "women/watches": "accessories", "women/perfumes": "accessories", "women/cufflinks": "accessories",
};
