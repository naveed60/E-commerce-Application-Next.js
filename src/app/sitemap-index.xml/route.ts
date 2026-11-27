import { prisma } from "@/lib/prisma";
import { absoluteUrl, indexingEnabled } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const count = indexingEnabled() ? await prisma.product.count({ where: { archived: false } }) : 0;
  const urls = [absoluteUrl("/sitemap.xml"), ...Array.from({ length: Math.max(1, Math.ceil(count / 10000)) }, (_, id) => absoluteUrl(`/products/sitemap/${id}.xml`))];
  const escape = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map((url) => `<sitemap><loc>${escape(url)}</loc></sitemap>`).join("")}</sitemapindex>`, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
