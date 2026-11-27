import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/landing/storefront-shell";
import { CATEGORY_CONTENT, PRODUCT_CATEGORY_VALUES } from "@/lib/product-categories";
import { pageMetadata } from "@/lib/seo";
import styles from "@/components/landing/storefront-design.module.css";

const sections = {
  collections: { title: "Our Collections", description: "Explore Drape & Line clothing for men, women and kids, plus everyday accessories." },
  essentials: { title: "Everyday Essentials", description: "Explore the current clothing and accessories collections. Check each product for available sizes, colours and materials." },
  stories: { title: "Shopping with Drape & Line", description: "Find your next wardrobe addition with product details, delivery information and customer support." },
};
type Section = keyof typeof sections;
export function generateStaticParams() { return Object.keys(sections).map((section) => ({ section })); }
export async function generateMetadata({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!Object.hasOwn(sections, section)) notFound();
  return pageMetadata({ ...sections[section as Section], path: `/${section}`, noIndex: section !== "collections" });
}
export default async function SectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  if (!Object.hasOwn(sections, section)) notFound();
  const content = sections[section as Section];
  return <StorefrontShell><main className="mx-auto min-h-[60vh] max-w-[1100px] px-5 py-16 md:px-10">
    <h1 className={`${styles.serif} text-5xl`}>{content.title}</h1><p className="mt-5 max-w-2xl leading-7 text-black/65">{content.description}</p>
    <div className="mt-10 grid gap-6 sm:grid-cols-2">{PRODUCT_CATEGORY_VALUES.map((category) => <Link key={category} href={`/collection/${category}`} className="rounded-2xl border border-black/10 bg-white p-7"><h2 className={`${styles.serif} text-3xl`}>{CATEGORY_CONTENT[category].title}</h2><p className="mt-3 text-sm leading-6 text-black/60">{CATEGORY_CONTENT[category].description}</p></Link>)}</div>
    <p className="mt-10 text-sm"><Link href="/info/shipping-delivery" className="underline">Shipping &amp; delivery</Link> · <Link href="/info/returns-exchanges" className="underline">Returns &amp; exchanges</Link> · <Link href="/info/contact-us" className="underline">Contact us</Link></p>
  </main></StorefrontShell>;
}
