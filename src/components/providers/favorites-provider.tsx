"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { StorefrontProduct } from "@/types/product";

type FavoriteItem = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type FavoritesContextValue = {
  favorites: FavoriteItem[];
  isOpen: boolean;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (product: StorefrontProduct) => void;
  removeFavorite: (id: string) => void;
  toggleDrawer: () => void;
  closeDrawer: () => void;
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

const STORAGE_KEY = "nextshop_favorites";

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after hydration to avoid server/client mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) setFavorites(parsed.filter((item) => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.image === "string" && typeof item.price === "number"));
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, hydrated]);

  const toggleFavorite = (product: StorefrontProduct) => {
    setFavorites((prev) => {
      if (prev.some((f) => f.id === product.id)) {
        return prev.filter((f) => f.id !== product.id);
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
        },
      ];
    });
  };

  const removeFavorite = (id: string) =>
    setFavorites((prev) => prev.filter((f) => f.id !== id));

  const value = useMemo(
    () => ({
      favorites,
      isOpen,
      isFavorite: (id: string) => favorites.some((f) => f.id === id),
      toggleFavorite,
      removeFavorite,
      toggleDrawer: () => setIsOpen((prev) => !prev),
      closeDrawer: () => setIsOpen(false),
    }),
    [favorites, isOpen],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used inside FavoritesProvider");
  }
  return ctx;
};
