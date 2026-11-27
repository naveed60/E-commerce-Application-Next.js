import type { MetadataRoute } from "next";
import { absoluteUrl, indexingEnabled } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    // Utility HTML remains crawlable so crawlers can see its noindex metadata.
    // Authentication, rather than robots rules, protects private customer data.
    rules: { userAgent: "*", ...(indexingEnabled() ? { allow: "/", disallow: ["/api/"] } : { disallow: "/" }) },
    sitemap: absoluteUrl("/sitemap-index.xml"),
  };
}
