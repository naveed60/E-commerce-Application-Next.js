export const PRODUCT_CATEGORIES = [
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
  { value: "accessories", label: "Accessories" },
] as const;

export const PRODUCT_CATEGORY_VALUES = ["men", "women", "kids", "accessories"] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORY_VALUES)[number];

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
