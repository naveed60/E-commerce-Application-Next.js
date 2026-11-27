import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { ReviewForm } from "./customer-forms";
import styles from "./storefront-design.module.css";
import { getProductRating, getRelatedProducts } from "@/lib/catalog";
import { CatalogImage } from "./catalog-image";

// Keep these queries inside independent Suspense boundaries so neither delays
// the product's image, price, stock status, or add-to-bag controls.
export async function ProductReviews({ productId }: { productId: string }) {
  const [reviews, summary] = await Promise.all([prisma.productReview.findMany({
    where: { productId, visible: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, rating: true, comment: true, user: { select: { name: true } } },
    take: 20,
  }), getProductRating(productId)]);

  return (
    <section id="customer-reviews" className="mt-20">
      <h2 className={`${styles.serif} text-4xl`}>Customer reviews</h2>
      {summary.reviewCount > reviews.length && <p className="mt-3 text-sm text-black/60">Showing the {reviews.length} most recent of {summary.reviewCount} published reviews.</p>}
      <div className="my-6 space-y-4">
        {reviews.length ? reviews.map((review) => (
          <article key={review.id} className="rounded-xl bg-white p-5">
            <p className="text-[#a36c00]">{"★".repeat(review.rating)}</p>
            <p className="mt-2 text-sm">{review.comment}</p>
            <p className="mt-2 text-xs text-black/50">{review.user.name || "Customer"}</p>
          </article>
        )) : <p className="text-sm text-black/60">No published reviews yet.</p>}
      </div>
      <ReviewForm productId={productId} />
    </section>
  );
}

export async function RelatedProducts({ productId, category }: { productId: string; category: string }) {
  const related = await getRelatedProducts(productId, category);

  if (!related.length) return null;

  return (
    <section className="mt-20">
      <h2 className={`${styles.serif} text-4xl`}>You may also like</h2>
      <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {related.map((item) => (
          <Link href={`/products/${encodeURIComponent(item.id)}`} key={item.id} className="group">
            <div className="relative aspect-[.82] overflow-hidden rounded-xl bg-[#eeeae5]">
              <CatalogImage src={item.image} alt={item.name} className="object-cover transition group-hover:scale-105" />
            </div>
            <p className="mt-3 font-bold">{item.name}</p>
            <p className="mt-1 text-sm">{item.hasVariants ? "From " : ""}{formatPrice(item.price)}</p>
            {(item.inventory ?? 0) <= 0 && <p className="mt-1 text-xs text-red-700">Out of stock</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}
