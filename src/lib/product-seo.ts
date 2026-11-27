import type { StorefrontProduct } from "@/types/product";
import { absoluteUrl, productPath, SITE_NAME } from "./seo";
import { getValidImageUrl } from "./utils";

export function productStructuredData(product: StorefrontProduct) {
  const url = absoluteUrl(productPath(product.id));
  const imageUrls = (images: string[]) => images.filter((image) => getValidImageUrl(image)).map((image) => absoluteUrl(image));
  const rating = product.reviewCount ? { aggregateRating: { "@type": "AggregateRating", ratingValue: Number(product.rating.toFixed(1)), reviewCount: product.reviewCount, bestRating: 5, worstRating: 1 } } : {};
  const offer = (price: number, inventory: number, offerUrl: string) => ({
    "@type": "Offer", url: offerUrl, price: price.toFixed(2), priceCurrency: "PKR",
    availability: `https://schema.org/${inventory > 0 ? "InStock" : "OutOfStock"}`,
    seller: { "@type": "OnlineStore", "@id": absoluteUrl("/#organization"), name: SITE_NAME, url: absoluteUrl("/") },
  });
  const base = { "@context": "https://schema.org", "@id": `${url}#product`, name: product.name,
    description: product.description, url, image: imageUrls([product.image]), ...rating };
  const variants = (product.variants ?? []).filter((v) => v.active);
  if (!product.hasVariants || !variants.length) {
    return { ...base, "@type": "Product", productID: product.id, offers: offer(product.price, product.hasVariants ? 0 : product.inventory ?? 0, url) };
  }
  return {
    ...base, "@type": "ProductGroup", productGroupID: product.id,
    variesBy: [...(variants.some((v) => v.colorId) ? ["https://schema.org/color"] : []), ...(variants.some((v) => v.size) ? ["https://schema.org/size"] : [])],
    hasVariant: variants.map((variant) => {
      const color = product.colors?.find((c) => c.id === variant.colorId);
      const colorImages = (color?.images ?? []).filter((image) => getValidImageUrl(image));
      const variantUrl = absoluteUrl(productPath(product.id, variant.id));
      return { "@type": "Product", "@id": `${variantUrl}#product`, name: [product.name, color?.name, variant.size].filter(Boolean).join(" — "),
        description: product.description, url: variantUrl, sku: variant.sku,
        ...(color ? { color: color.name } : {}), ...(variant.size ? { size: variant.size } : {}),
        image: imageUrls(colorImages.length ? colorImages : [product.image]),
        offers: offer(variant.price ?? product.price, variant.inventory, variantUrl),
      };
    }),
  };
}
