import { LandingScreen } from "@/components/landing/landing-screen";
import { getHomeProducts } from "@/lib/catalog";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, pageMetadata, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata = pageMetadata({ title: "Clothing & Accessories Online in Pakistan", description: SITE_DESCRIPTION, path: "/" });

export default async function NextShopPage() {
  const products = await getHomeProducts();
  return <>
    <JsonLd data={{ "@context": "https://schema.org", "@type": "OnlineStore", "@id": absoluteUrl("/#organization"), name: SITE_NAME, url: absoluteUrl("/"), description: SITE_DESCRIPTION }} />
    <LandingScreen products={products} />
  </>;
}
