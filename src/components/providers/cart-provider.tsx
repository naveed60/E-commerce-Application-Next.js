"use client";

import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/data/products";

type SelectedVariant = { id: string; color?: string; size?: string; sku: string; price: number; image: string; inventory: number };
type CartProduct = Product & { hasVariants?: boolean; inventory?: number };
type CartItem = {
  productId: string;
  variantId?: string;
  color?: string;
  size?: string;
  sku?: string;
  maxQuantity?: number;
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  total: number;
  itemCount: number;
  isOpen: boolean;
  addItem: (product: CartProduct, variant?: SelectedVariant) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "nextshop_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return;
      }

      const normalized = parsed
        .filter(
          (item) =>
            item &&
            typeof item.id === "string" &&
            typeof item.name === "string" &&
            typeof item.image === "string" &&
            typeof item.price === "number" &&
            Number.isFinite(item.price) &&
            typeof item.quantity === "number" &&
            Number.isFinite(item.quantity) &&
            item.quantity > 0,
        )
        .map((item) => ({
          id: typeof item.variantId === "string" ? `${item.productId}:${item.variantId}` : item.id,
          productId: typeof item.productId === "string" ? item.productId : item.id,
          variantId: typeof item.variantId === "string" ? item.variantId : undefined,
          color: typeof item.color === "string" ? item.color : undefined,
          size: typeof item.size === "string" ? item.size : undefined,
          sku: typeof item.sku === "string" ? item.sku : undefined,
          maxQuantity: Number.isInteger(item.maxQuantity) ? Math.max(1, Math.min(10, item.maxQuantity)) : 10,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: Math.min(10, Math.floor(item.quantity)),
        }));

      setItems(normalized);
    } catch {
      window.localStorage.removeItem(CART_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items, isHydrated]);

  const addItem = useCallback((product: CartProduct, variant?: SelectedVariant) => {
    if (product.hasVariants && !variant) {
      router.push(`/products/${encodeURIComponent(product.id)}`);
      return;
    }
    const inventory = variant?.inventory ?? product.inventory ?? 10;
    if (inventory <= 0) return;
    const maxQuantity = Math.min(10, inventory);
    const lineId = variant ? `${product.id}:${variant.id}` : product.id;
    setItems((prev) => {
      const existing = prev.find((item) => item.id === lineId);
      if (existing) {
        return prev.map((item) =>
          item.id === lineId
            ? { ...item, maxQuantity, price: variant?.price ?? product.price, image: variant?.image ?? product.image, quantity: Math.min(maxQuantity, item.quantity + 1) }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: lineId,
          productId: product.id,
          variantId: variant?.id,
          color: variant?.color,
          size: variant?.size,
          sku: variant?.sku,
          maxQuantity,
          name: product.name,
          image: variant?.image ?? product.image,
          price: variant?.price ?? product.price,
          quantity: 1,
        },
      ];
    });
    setIsOpen(true);
  }, [router]);

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const setQuantity = (id: string, quantity: number) => {
    if (!Number.isFinite(quantity)) return;
    const nextQuantity = Math.min(10, Math.floor(quantity));
    setItems((prev) => nextQuantity <= 0
      ? prev.filter((item) => item.id !== id)
      : prev.map((item) => item.id === id ? { ...item, quantity: Math.min(item.maxQuantity ?? 10, nextQuantity) } : item));
  };

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      total,
      itemCount,
      isOpen,
      addItem,
      removeItem,
      setQuantity,
      clearCart: () => setItems([]),
      toggleCart: () => setIsOpen((prev) => !prev),
      closeCart: () => setIsOpen(false),
    }),
    [items, total, itemCount, isOpen, addItem],
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};
