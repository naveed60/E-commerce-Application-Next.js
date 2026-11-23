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
  createdAt: string;
};
