import Link from "next/link";
import { notFound } from "next/navigation";
import { StorefrontShell } from "@/components/landing/storefront-shell";
import { pageMetadata } from "@/lib/seo";
import styles from "@/components/landing/storefront-design.module.css";

const archivedEdits: Record<string, string> = { "new-in-studio": "New in studio", "outdoor-edits": "Outdoor edits", "daily-carry": "Daily carry", wellness: "Wellness", workspace: "Workspace" };
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(archivedEdits).map((slug) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!Object.hasOwn(archivedEdits, slug)) notFound();
  return pageMetadata({ title: archivedEdits[slug], description: "This previous collection is no longer available. Explore the current Drape & Line collections.", path: `/categories/${slug}`, noIndex: true });
}
export default async function ArchivedCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!Object.hasOwn(archivedEdits, slug)) notFound();
  return <StorefrontShell><main className="mx-auto min-h-[60vh] max-w-3xl px-6 py-20"><h1 className={`${styles.serif} text-5xl`}>{archivedEdits[slug]}</h1><p className="mt-6 leading-7 text-black/65">This previous collection is no longer available. Explore our current clothing and accessories instead.</p><Link href="/collections" className="mt-8 inline-flex rounded-full bg-[#06472f] px-6 py-3 font-semibold text-white">Explore current collections</Link></main></StorefrontShell>;
}
