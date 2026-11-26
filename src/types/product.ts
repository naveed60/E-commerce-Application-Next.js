export type ProductColor = { id: string; name: string; swatch: string; images: string[] };
export type ProductVariant = { id: string; colorId: string | null; size: string; sku: string; price: number | null; inventory: number; active: boolean };

export type StorefrontProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  tags: string[];
  rating: number;
  featured: boolean;
  category: string;
  inventory?: number;
  hasVariants?: boolean;
  colors?: ProductColor[];
  variants?: ProductVariant[];
  createdAt: string;
};
