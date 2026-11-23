import { display, sans } from "@/components/landing/storefront-fonts";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${sans.variable}`}>{children}</div>;
}
