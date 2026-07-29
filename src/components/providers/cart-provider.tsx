"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";

type CartItem = {
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
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const CART_STORAGE_KEY = "nextshop_cart_items_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
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
          id: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: Math.floor(item.quantity),
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

  const addItem = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          quantity: 1,
        },
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
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
      clearCart: () => setItems([]),
      toggleCart: () => setIsOpen((prev) => !prev),
      closeCart: () => setIsOpen(false),
    }),
    [items, total, itemCount, isOpen],
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
