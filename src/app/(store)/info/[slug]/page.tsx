import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/landing/storefront-shell";
import { RefundForm } from "@/components/landing/customer-forms";
import { OrderLookup } from "@/components/landing/order-lookup";
import styles from "@/components/landing/storefront-design.module.css";

import { INFO_PAGES as pages } from "@/lib/info-pages";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!Object.hasOwn(pages, slug)) notFound();
  const page = pages[slug];
  if (!page) notFound();
  return pageMetadata({ title: page.title, description: page.intro, path: `/info/${slug}`, noIndex: page.noIndex });
}


export function generateStaticParams() { return Object.keys(pages).map((slug) => ({ slug })); }
export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!Object.hasOwn(pages, slug)) notFound();
  const page = pages[slug];
  if (!page) notFound();
  return <StorefrontShell><main className="mx-auto min-h-[60vh] max-w-[1050px] px-5 py-16 md:px-10 md:py-24"><p className="text-xs font-bold uppercase tracking-[.3em] text-[#d9233f]">{page.eyebrow}</p><h1 className={`${styles.serif} mt-4 text-5xl leading-tight md:text-7xl`}>{page.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-black/65">{page.intro}</p>{slug === "track-order" && <OrderLookup />}{slug === "returns-exchanges" && <RefundForm />}<div className="mt-12 grid gap-5 md:grid-cols-2">{page.sections.map((section) => <article key={section.title} className="rounded-2xl border border-black/10 bg-white p-7 shadow-sm"><h2 className={`${styles.serif} text-3xl`}>{section.title}</h2><p className="mt-4 leading-7 text-black/65">{section.text}</p></article>)}</div><Link href="/shop" className="mt-8 inline-flex rounded-full bg-[#06472f] px-7 py-3 text-sm font-bold text-white">Back to shopping</Link></main></StorefrontShell>;
}
