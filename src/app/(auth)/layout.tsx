import type { ReactNode } from "react";
import { display, sans } from "@/components/landing/storefront-fonts";
import { StorefrontShell } from "@/components/landing/storefront-shell";
import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Your account", robots: PRIVATE_ROBOTS };

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <div className={`${display.variable} ${sans.variable}`}><StorefrontShell><main className="mx-auto flex min-h-[70vh] max-w-[1100px] items-center px-5 py-12 md:px-10">{children}</main></StorefrontShell></div>;
}
