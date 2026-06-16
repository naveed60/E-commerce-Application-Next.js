"use client";

import { Moon, SunMedium } from "lucide-react";

import { cn } from "@/lib/utils";

export type AdminTheme = "light" | "dark";

type AdminThemeToggleProps = {
  theme: AdminTheme;
  onChange: (theme: AdminTheme) => void;
  className?: string;
};

export function AdminThemeToggle({
  theme,
  onChange,
  className,
}: AdminThemeToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-1 shadow-sm",
        className,
      )}
      aria-label="Theme switch"
    >
      <button
        type="button"
        onClick={() => onChange("light")}
        aria-pressed={theme === "light"}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
          theme === "light"
            ? "bg-[var(--admin-accent)] text-white shadow-[0_10px_24px_var(--admin-ring)]"
            : "text-[var(--admin-text-soft)] hover:text-[var(--admin-text)]",
        )}
      >
        <SunMedium className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onChange("dark")}
        aria-pressed={theme === "dark"}
        className={cn(
          "inline-flex h-8 w-8 items-center justify-center rounded-full transition",
          theme === "dark"
            ? "bg-[var(--admin-accent)] text-white shadow-[0_10px_24px_var(--admin-ring)]"
            : "text-[var(--admin-text-soft)] hover:text-[var(--admin-text)]",
        )}
      >
        <Moon className="h-4 w-4" />
      </button>
    </div>
  );
}
