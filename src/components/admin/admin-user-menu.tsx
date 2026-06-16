"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminUser = {
  name?: string | null;
  email?: string | null;
  role?: string | null;
};

type AdminUserMenuProps = {
  user?: AdminUser;
  onSignOut: () => void;
  className?: string;
};

export function AdminUserMenu({
  user,
  onSignOut,
  className,
}: AdminUserMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    const source = user?.name?.trim() || user?.email?.trim() || "A";
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0] ?? "A"}${parts[1][0] ?? ""}`.toUpperCase();
  }, [user?.email, user?.name]);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div className={cn("relative", className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-3 rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] px-2 py-1.5 pr-3 text-left shadow-sm transition hover:border-[var(--admin-border-strong)]"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--admin-accent)] text-sm font-semibold text-white">
          {initials}
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block truncate text-sm font-semibold text-[var(--admin-text)]">
            {user?.name?.trim() || "Admin user"}
          </span>
          <span className="block truncate text-xs text-[var(--admin-text-soft)]">
            {user?.email?.trim() || "No email"}
          </span>
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--admin-text-soft)] transition",
            open && "rotate-180",
          )}
        />
      </button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 overflow-hidden rounded-3xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] shadow-[0_24px_50px_rgba(15,23,42,0.14)]">
          <div className="flex items-center gap-3 border-b border-[var(--admin-border)] px-4 py-4">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--admin-accent)] text-sm font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--admin-text)]">
                {user?.name?.trim() || "Admin user"}
              </p>
              <p className="truncate text-xs text-[var(--admin-text-soft)]">
                {user?.email?.trim() || "No email"}
              </p>
            </div>
          </div>
          <div className="p-2">
            <Link
              href="/nextshop"
              className="flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium text-[var(--admin-text)] transition hover:bg-[var(--admin-bg-soft)]"
            >
              View storefront
            </Link>
            <button
              type="button"
              onClick={onSignOut}
              className="mt-1 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-rose-500 transition hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
