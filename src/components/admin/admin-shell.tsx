"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingBag,
  Store,
  Users,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

import { AdminThemeToggle, type AdminTheme } from "./admin-theme-toggle";
import { AdminUserMenu } from "./admin-user-menu";

const navItems = [
  { label: "Analytics", href: "/nextshop/admin/overview", icon: LayoutDashboard },
  { label: "Orders", href: "/nextshop/admin/orders", icon: ShoppingBag },
  { label: "Products", href: "/nextshop/admin/products", icon: Package },
  { label: "Customers", href: "/nextshop/admin/customers", icon: Users },
  { label: "Insights", href: "/nextshop/admin/analytics", icon: BarChart3 },
  { label: "Settings", href: "/nextshop/admin/settings", icon: Settings },
];

type AdminSidebarUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type AdminShellProps = {
  children: ReactNode;
  user?: AdminSidebarUser;
  initialTheme?: AdminTheme;
};

export function AdminShell({
  children,
  user,
  initialTheme = "light",
}: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [theme, setTheme] = useState<AdminTheme>(initialTheme);
  const [loggingOut, setLoggingOut] = useState(false);

  const userLabel = useMemo(() => {
    const source = user?.name?.trim() || user?.email?.trim() || "Admin";
    return source;
  }, [user?.email, user?.name]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      const storedTheme = window.localStorage.getItem("nextshop-admin-theme");
      if (storedTheme === "light" || storedTheme === "dark") {
        setTheme(storedTheme);
      }
    } catch {
      // Persistence is best-effort.
    }
  }, []);

  useEffect(() => {
    try {
      document.cookie = `nextshop-admin-theme=${theme}; path=/; max-age=31536000; samesite=lax`;
      window.localStorage.setItem("nextshop-admin-theme", theme);
      document.documentElement.dataset.adminTheme = theme;
      document.documentElement.style.colorScheme = theme;
    } catch {
      // Persistence is best-effort.
    }
  }, [theme]);

  useEffect(() => {
    return () => {
      delete document.documentElement.dataset.adminTheme;
      document.documentElement.style.colorScheme = "";
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  return (
    <div className="admin-shell min-h-screen bg-[var(--admin-bg)] text-[var(--admin-text)]" data-theme={theme}>
      <div className="flex min-h-screen">
        <div
          className={cn(
            "fixed inset-0 z-40 bg-slate-950/55 transition-opacity lg:hidden",
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0",
          )}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />

        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-[var(--admin-sidebar-border)] text-[var(--admin-sidebar-text)] shadow-[0_24px_60px_rgba(15,23,42,0.22)] transition-transform duration-300 lg:sticky lg:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
          style={{
            backgroundImage:
              "linear-gradient(180deg, var(--admin-sidebar-start) 0%, var(--admin-sidebar-end) 100%)",
          }}
        >
          <div className="flex items-center justify-between border-b border-[var(--admin-sidebar-border)] px-5 py-5">
            <Link
              href="/nextshop/admin/overview"
              className="flex items-baseline gap-1 text-lg font-semibold tracking-tight text-[var(--admin-sidebar-text)]"
            >
              <span>Admin-</span>
              <span className="text-[var(--admin-accent)]">NextShop</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--admin-sidebar-border)] text-[var(--admin-sidebar-muted)] transition hover:bg-[var(--admin-sidebar-hover-bg)] hover:text-[var(--admin-sidebar-text)] lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 text-sm">
            <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--admin-sidebar-muted)]">
              Navigation
            </p>
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "group flex items-center justify-between rounded-2xl px-3 py-3.5 font-medium transition",
                    isActive
                      ? "bg-[var(--admin-sidebar-active-bg)] text-[var(--admin-sidebar-text)] shadow-[0_10px_30px_rgba(89,84,247,0.18)]"
                      : "text-[var(--admin-sidebar-muted)] hover:bg-[var(--admin-sidebar-hover-bg)] hover:text-[var(--admin-sidebar-text)]",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl border border-transparent transition",
                        isActive
                          ? "bg-[color-mix(in_srgb,var(--admin-accent)_18%,transparent)] text-[var(--admin-sidebar-text)]"
                          : "bg-transparent text-inherit group-hover:bg-[var(--admin-sidebar-hover-bg)]",
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      "h-2.5 w-2.5 rounded-full transition",
                      isActive
                        ? "bg-[var(--admin-accent)] shadow-[0_0_0_6px_rgba(89,84,247,0.14)]"
                        : "bg-white/0",
                    )}
                  />
                </Link>
              );
            })}

            <div className="pt-5">
              <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--admin-sidebar-muted)]">
                Application
              </p>
              <Link
                href="/nextshop"
                className="flex items-center justify-between rounded-2xl px-3 py-3.5 text-[var(--admin-sidebar-muted)] transition hover:bg-[var(--admin-sidebar-hover-bg)] hover:text-[var(--admin-sidebar-text)]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[var(--admin-sidebar-hover-bg)]">
                    <Store className="h-4 w-4" />
                  </span>
                  Main Site
                </span>
              </Link>
            </div>
          </nav>

          
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text)] shadow-sm transition hover:border-[var(--admin-border-strong)] lg:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-[clamp(1.8rem,2.3vw,2.3rem)] font-semibold tracking-tight text-[var(--admin-text)]">
                    Dashboard
                  </h1>
                  <p className="text-sm text-[var(--admin-text-soft)]">
                    NextShop Admin Dashboard
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="hidden min-w-[220px] items-center gap-3 rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-4 py-3 shadow-sm sm:flex">
                  <Search className="h-4 w-4 text-[var(--admin-text-muted)]" />
                  <input
                    type="search"
                    placeholder="Search"
                    className="w-full bg-transparent text-sm text-[var(--admin-text)] outline-none placeholder:text-[var(--admin-text-muted)]"
                  />
                </label>

                <AdminThemeToggle theme={theme} onChange={setTheme} />

                <button
                  type="button"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] text-[var(--admin-text)] shadow-sm transition hover:border-[var(--admin-border-strong)]"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold leading-none text-white">
                    2
                  </span>
                </button>

                <AdminUserMenu
                  user={user}
                  onSignOut={async () => {
                    await signOut({ callbackUrl: "/login" });
                  }}
                />
              </div>
            </div>
          </header>

          <main className="flex-1 bg-[var(--admin-bg)] px-4 py-5 sm:px-6 lg:px-6 lg:py-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
