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

const categoryNavItems = [
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
    } catch {
      toast.error("Unable to sign out");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#0f2e26]">
        <div className="mx-auto flex items-center px-8 py-4" style={{ maxWidth: "1500px" }}>
          <Link href="/nextshop" className="mr-6 shrink-0" aria-label="Go to NextShop home">
            <Image
              src="/nextshop-logo-v2.png"
              alt="NextShop logo"
              width={48}
              height={48}
              priority
              className="h-12 w-12 object-contain brightness-0 invert"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {categoryNavItems.map((cat) => (
              <div
                key={cat.label}
                className="relative"
                onMouseEnter={() => setOpenCategory(cat.label)}
                onMouseLeave={() => setOpenCategory(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-bold uppercase tracking-wide text-white/80 transition hover:text-[#fdc402]"
                >
                  {cat.label}
                  <ChevronDown className="h-3 w-3" />
                </button>
                <div
                  className={cn(
                    "absolute left-0 top-full z-50 w-52 origin-top rounded-sm border border-[#eaeaea] bg-white py-2 shadow-lg transition-all duration-200 ease-out",
                    openCategory === cat.label
                      ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100"
                      : "pointer-events-none -translate-y-1 scale-y-95 opacity-0",
                  )}
                >
                  {cat.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2.5 text-sm text-[#535353] transition hover:bg-[#f5f5f5] hover:text-[#181818]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>

          <div className="mx-auto hidden max-w-md flex-1 px-8 md:block">
            <HeaderSearchBox
              value={searchTerm}
              onChange={onSearchChange}
              onSubmit={onSearchSubmit}
              suggestions={normalizedSuggestions}
              placeholder="Enter your Keywords"
            />
          </div>

          <div className="ml-auto flex items-center gap-5">
            <button
              type="button"
              onClick={toggleFavorites}
              className="relative text-white/80 transition hover:text-[#fdc402]"
              aria-label="Favorites"
            >
              <Heart className={`h-5 w-5 ${favorites.length > 0 ? "fill-[#fdc402] text-[#fdc402]" : ""}`} />
              {favorites.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-white/20 px-1 text-[10px] font-bold text-white">
                  {favorites.length}
                </span>
              )}
            </button>

            {status === "authenticated" ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="text-white/80 transition hover:text-[#fdc402]"
                  aria-label="User profile"
                >
                  <User className="h-5 w-5" />
                </button>
                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-sm border border-[#eaeaea] bg-white p-4 shadow-lg">
                      <p className="mb-1 text-sm font-bold text-[#181818]">{session?.user?.name}</p>
                      <p className="mb-4 text-xs text-[#535353]">{session?.user?.email}</p>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full border border-[#eaeaea] px-4 py-2 text-sm font-bold text-[#181818] transition hover:bg-[#fdc402]"
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
                className="hidden text-sm font-bold uppercase tracking-wide text-white/80 transition hover:text-[#fdc402] md:block"
              >
                Account
              </button>
            )}

            <button
              type="button"
              onClick={toggleCart}
              className="relative text-white/80 transition hover:text-[#fdc402]"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-white">
                {itemCount}
              </span>
            </button>

            <button
              type="button"
              className="hidden items-center gap-2 text-sm font-bold uppercase tracking-wide text-white/80 transition hover:text-[#fdc402] md:flex"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="flex flex-col gap-[3px]">
                <span className="block h-[2px] w-5 bg-current" />
                <span className="block h-[2px] w-5 bg-current" />
              </span>
              Menu
            </button>

            <button
              type="button"
              className="text-white/80 transition hover:text-[#fdc402] md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="border-t border-white/10 px-8 py-3 md:hidden">
          <HeaderSearchBox
            value={searchTerm}
            onChange={onSearchChange}
            onSubmit={onSearchSubmit}
            suggestions={normalizedSuggestions}
            placeholder="Enter your Keywords"
          />
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity",
          sidebarOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 transform flex-col border-r border-[#eaeaea] bg-white p-6 shadow-2xl transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-wide text-[#181818]">Menu</span>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-full p-2 text-[#535353] transition hover:bg-[#f5f5f5]"
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
                className="flex w-full items-center justify-between px-3 py-3 font-bold uppercase tracking-wide text-[#181818] transition hover:bg-[#f5f5f5]"
              >
                {cat.label}
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-[#535353] transition-transform duration-200",
                    openSidebarCat === cat.label && "rotate-180",
                  )}
                />
              </button>
              {openSidebarCat === cat.label && (
                <div className="ml-3 mt-1 space-y-0.5 border-l border-[#eaeaea] pl-3">
                  {cat.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className="block rounded-sm px-3 py-2.5 text-[#535353] transition hover:bg-[#f5f5f5] hover:text-[#181818]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {status === "authenticated" ? (
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-8 flex w-full items-center justify-center gap-2 border border-[#eaeaea] px-4 py-3 text-sm font-bold text-[#181818] transition hover:bg-[#fdc402]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSignIn}
            className="mt-8 w-full border border-[#eaeaea] px-4 py-3 text-sm font-bold text-[#181818] transition hover:bg-[#fdc402]"
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
};

function HeaderSearchBox({
  value,
  onChange,
  onSubmit,
  suggestions,
  placeholder,
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
    <div className="relative w-full">
      <div className="flex items-center border border-white/20 bg-white/10 px-4 py-2 text-sm text-white">
        <Search className="mr-3 h-4 w-4 text-white/60" />
        <input
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setFocused(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
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
            }
            if (event.key === "Escape") {
              setFocused(false);
              setActiveIndex(-1);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 bg-transparent outline-none placeholder:text-white/50"
        />
      </div>
      {showSuggestions && (
        <div className="absolute left-0 right-0 top-full z-50 overflow-hidden border border-[#eaeaea] bg-white shadow-lg">
          <ul className="max-h-72 overflow-y-auto py-1">
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
                      ? "bg-[#f5f5f5] text-[#181818]"
                      : "text-[#535353] hover:bg-[#f5f5f5] hover:text-[#181818]"
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
