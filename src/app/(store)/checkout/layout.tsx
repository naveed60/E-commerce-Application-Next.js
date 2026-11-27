import type { Metadata } from "next";
import { PRIVATE_ROBOTS } from "@/lib/seo";

export const metadata: Metadata = { title: "Checkout", robots: PRIVATE_ROBOTS };

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
