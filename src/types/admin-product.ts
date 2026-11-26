import type { ProductColor, ProductVariant } from "./product";
export type AdminProductSummary = {
  id: string;
  name: string;
  description: string;
  priceLabel: string;
  priceValue: number;
  image: string;
  category: string;
  tags: string[];
  inventory: number;
  featured: boolean;
  rating: number;
};

export type AdminProductFormInitialData = {
  hasVariants?: boolean;
  colors?: ProductColor[];
  variants?: ProductVariant[];
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tags: string[];
  inventory: number;
  rating: number;
  featured: boolean;
};
