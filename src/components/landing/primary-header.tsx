"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LogOut,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/providers/cart-provider";
import { useFavorites } from "@/components/providers/favorites-provider";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type HeaderProps = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (value: string) => void;
  searchSuggestions?: string[];
};

const navLinks: { label: string; href: string }[] = [];

type CategoryNavItem = {
  label: string;
  items: { label: string; href: string }[];
};

const categoryNavItems: CategoryNavItem[] = [
  {
    label: "MEN",
    items: [
      { label: "Un-Stitch", href: "/nextshop/men/un-stitch" },
      { label: "Stitch", href: "/nextshop/men/stitch" },
      { label: "Watch Collection", href: "/nextshop/men/watches" },
      { label: "Perfume Collection", href: "/nextshop/men/perfumes" },
      { label: "Cufflinks", href: "/nextshop/men/cufflinks" },
    ],
  },
  {
    label: "WOMEN",
    items: [
      { label: "Un-Stitch", href: "/nextshop/women/un-stitch" },
      { label: "Stitch", href: "/nextshop/women/stitch" },
      { label: "Watch Collection", href: "/nextshop/women/watches" },
      { label: "Perfume Collection", href: "/nextshop/women/perfumes" },
      { label: "Cufflinks", href: "/nextshop/women/cufflinks" },
    ],
  },
  {
    label: "KIDS",
    items: [
      { label: "Baby Boys Suits", href: "/nextshop/kids/baby-boys-suits" },
      { label: "Baby Girls Suits", href: "/nextshop/kids/baby-girls-suits" },
    ],
  },
];

export function PrimaryHeader({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  searchSuggestions = [],
}: HeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSidebarCat, setOpenSidebarCat] = useState<string | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const normalizedSuggestions = useMemo(
    () =>
      Array.from(
        new Set(searchSuggestions.map((item) => item.trim()).filter(Boolean))
      ).slice(0, 12),
    [searchSuggestions]
  );
  const { itemCount, toggleCart } = useCart();
  const { favorites, toggleDrawer: toggleFavorites } = useFavorites();
  const { status, data: session } = useSession();
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();

  const handleSignIn = () => {
    const redirectPath = `${window.location.pathname}${window.location.search}`;
    router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`);
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut({ redirect: false });
      toast.success("Signed out");
      router.push("/nextshop");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Unable to sign out");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-3 z-30 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-4 border border-slate-800/70 bg-slate-900/97 px-4 py-4 shadow-[0_8px_40px_rgba(0,0,0,0.28)] transition sm:rounded-3xl">
          <Link
            href="/nextshop"
            className="flex items-center gap-3"
            aria-label="Go to NextShop home"
          >
            <Image
              src="/nextshop-logo-v2.png"
              alt="NextShop logo"
              width={48}
              height={48}
              priority
              className="h-12 w-12 object-contain"
            />
          </Link>
          <nav className="hidden flex-1 items-center justify-center gap-6 text-sm text-slate-400 sm:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            {categoryNavItems.map((cat) => (
              <div
                key={cat.label}
                className="relative pb-2"
                onMouseEnter={() => setOpenCategory(cat.label)}
                onMouseLeave={() => setOpenCategory(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 font-semibold tracking-wide text-slate-200 transition hover:text-white"
                >
                  {cat.label}
                  <svg className="h-3 w-3 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className={cn(
                    "absolute left-0 top-full z-50 w-52 origin-top rounded-2xl border border-zinc-100 bg-white py-2 shadow-xl transition-all duration-200 ease-out",
                    openCategory === cat.label
                      ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100"
                      : "pointer-events-none -translate-y-1 scale-y-95 opacity-0",
                  )}
                >
                  {cat.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-900"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <HeaderSearchBox
            value={searchTerm}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            suggestions={normalizedSuggestions}
            placeholder="Search for curated objects..."
            containerClassName="hidden flex-1 sm:block"
            fieldClassName="rounded-full shadow-inner"
          />
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFavorites}
              className="relative rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800/60"
              aria-label="Favorites"
            >
              <Heart className={`h-5 w-5 transition ${favorites.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              {favorites.length > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] font-semibold text-white">
                  {favorites.length}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={toggleCart}
              className="relative rounded-full border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800/60"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-[oklch(0.58_0.15_256.18)] px-1 text-[11px] font-semibold text-white">
                  {itemCount}
                </span>
              )}
            </button>
            {status === "authenticated" ? (
              <div className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="rounded-full border border-zinc-200 p-2 text-zinc-600 transition hover:border-zinc-400"
                  aria-label="User profile"
                >
                  <User className="h-5 w-5" />
                </button>

                {profileOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-zinc-100 bg-white p-4 shadow-xl">
                      <div className="mb-4">
                        <p className="text-sm font-medium text-zinc-900">
                          {session?.user?.name}
                        </p>
                        <p className="text-xs text-zinc-500 truncate">
                          {session?.user?.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full rounded-xl border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-zinc-400 hover:bg-zinc-50"
                        disabled={signingOut}
                      >
                        {signingOut ? "Signing out..." : "Sign out"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleSignIn}
                className="hidden rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-400 hover:bg-slate-800 sm:block"
              >
                Sign in
              </button>
            )}
            <button
              type="button"
              className="rounded-2xl border border-slate-700 p-2 text-slate-300 transition hover:border-slate-500 hover:bg-slate-800/60 sm:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="mt-3 px-4 sm:hidden">
          <HeaderSearchBox
            value={searchTerm}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            suggestions={normalizedSuggestions}
            placeholder="Search products"
            containerClassName="sm:hidden"
            fieldClassName="rounded-2xl"
          />
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/20 backdrop-blur-sm transition-opacity",
          sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-slate-800 bg-slate-900 p-6 shadow-2xl transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-300">Categories</p>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-full border border-transparent p-2 text-slate-400 hover:border-slate-700 hover:bg-slate-800"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-6 flex-1 space-y-1 text-sm">
          {categoryNavItems.map((cat) => (
            <div key={cat.label}>
              <button
                type="button"
                onClick={() =>
                  setOpenSidebarCat(openSidebarCat === cat.label ? null : cat.label)
                }
                className="flex w-full items-center justify-between rounded-2xl px-3 py-3 font-semibold tracking-wide text-slate-200 transition hover:bg-slate-800"
              >
                {cat.label}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-slate-500 transition-transform duration-200",
                    openSidebarCat === cat.label && "rotate-180",
                  )}
                />
              </button>
              {openSidebarCat === cat.label && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-slate-800 pl-3">
                  {cat.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="block rounded-xl px-3 py-2.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {status === "authenticated" && (
          <div className="mt-8 flex items-center gap-3">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-3 rounded-[28px] border border-slate-700 bg-slate-800 px-4 py-4 text-left text-white shadow-sm transition hover:border-slate-600"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-600 bg-slate-700 text-slate-300">
                <User className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {session?.user?.name ?? "Account"}
                </p>
                <p className="truncate text-xs text-slate-400">
                  {session?.user?.email}
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-slate-700 bg-slate-800 text-slate-300 shadow-sm transition hover:border-slate-600 disabled:opacity-60"
              aria-label="Sign out"
              disabled={signingOut}
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        )}
        {status !== "authenticated" && (
          <button
            type="button"
            onClick={handleSignIn}
            className="mt-8 w-full rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800 sm:hidden"
          >
            Sign in
          </button>
        )}
      </aside>
    </>
  );
}

type HeaderSearchBoxProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  containerClassName?: string;
  fieldClassName?: string;
};

function HeaderSearchBox({
  value,
  onChange,
  onSubmit,
  suggestions,
  placeholder,
  containerClassName,
  fieldClassName,
}: HeaderSearchBoxProps) {
  const [focused, setFocused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const filteredSuggestions = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) return suggestions.slice(0, 8);

    const startsWith = suggestions.filter((item) =>
      item.toLowerCase().startsWith(query)
    );
    const contains = suggestions.filter(
      (item) =>
        !item.toLowerCase().startsWith(query) &&
        item.toLowerCase().includes(query)
    );
    return [...startsWith, ...contains].slice(0, 8);
  }, [suggestions, value]);
  const showSuggestions = focused && filteredSuggestions.length > 0;

  const submitSearch = () => {
    const query = value.trim();
    onChange(query);
    onSubmit?.(query);
    setFocused(false);
    setActiveIndex(-1);
  };

  const selectSuggestion = (suggestion: string) => {
    onChange(suggestion);
    onSubmit?.(suggestion);
    setFocused(false);
    setActiveIndex(-1);
  };

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <div
        className={cn(
          "flex items-center border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm text-white",
          fieldClassName
        )}
      >
        <Search className="mr-3 h-4 w-4 text-slate-400" />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setFocused(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setTimeout(() => setFocused(false), 120);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (!filteredSuggestions.length) return;
              setActiveIndex((prev) =>
                prev >= filteredSuggestions.length - 1 ? 0 : prev + 1
              );
              return;
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              if (!filteredSuggestions.length) return;
              setActiveIndex((prev) =>
                prev <= 0 ? filteredSuggestions.length - 1 : prev - 1
              );
              return;
            }

            if (event.key === "Enter") {
              event.preventDefault();
              if (activeIndex >= 0 && filteredSuggestions[activeIndex]) {
                selectSuggestion(filteredSuggestions[activeIndex]);
                return;
              }
              submitSearch();
              return;
            }

            if (event.key === "Escape") {
              setFocused(false);
              setActiveIndex(-1);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none placeholder:text-slate-400"
        />
        <button
          type="button"
          onClick={submitSearch}
          aria-label="Search products"
          className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-700 hover:text-slate-200"
        >
          <Search className="h-4 w-4" />
        </button>
      </div>

      {showSuggestions && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xl">
          <ul className="max-h-72 overflow-y-auto py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filteredSuggestions.map((suggestion, index) => (
              <li key={`${suggestion}-${index}`}>
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    selectSuggestion(suggestion);
                  }}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm transition",
                    index === activeIndex
                      ? "bg-zinc-100 text-zinc-900"
                      : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                  )}
                >
                  {suggestion}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
