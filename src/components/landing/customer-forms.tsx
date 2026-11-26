"use client";
import Link from "next/link";
import { useActionState } from "react";
import { useSession } from "next-auth/react";
import { submitRefund, submitReview } from "@/app/(store)/customer-actions";

const field = "mt-2 w-full rounded-xl border border-black/15 bg-white px-4 py-3 text-sm outline-none focus:border-[#06472f]";
export function ReviewForm({ productId }: { productId: string }) {
  const { status } = useSession();
  const [result, action, pending] = useActionState(submitReview, { message: "", success: false });
  if (status === "loading") return null;
  if (status !== "authenticated") return <Link href={`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`} className="text-sm font-bold text-[#06472f] underline">Sign in to write a review</Link>;
  if (result.success) return <p role="status" className="text-sm text-[#06472f]">{result.message}</p>;
  return <form action={action} className="max-w-xl space-y-4"><input type="hidden" name="productId" value={productId} /><label className="block text-sm font-bold">Rating<select name="rating" defaultValue="5" className={field}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label><label className="block text-sm font-bold">Your review<textarea name="comment" required minLength={5} maxLength={2000} rows={4} className={field} /></label>{result.message && <p role="alert" className="text-sm text-red-700">{result.message}</p>}<button disabled={pending} className="rounded-full bg-[#06472f] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{pending ? "Submitting…" : "Submit review"}</button></form>;
}
export function RefundForm() {
  const { status } = useSession();
  const [result, action, pending] = useActionState(submitRefund, { message: "", success: false });
  if (status === "loading") return null;
  if (status !== "authenticated") return <Link href="/login?redirect=/info/returns-exchanges" className="mt-8 inline-block text-sm font-bold text-[#06472f] underline">Sign in to request a return or refund</Link>;
  if (result.success) return <p role="status" className="mt-8 text-sm text-[#06472f]">{result.message}</p>;
  return <form action={action} className="mt-8 max-w-xl space-y-4 rounded-2xl bg-white p-6"><h2 className="font-serif text-3xl">Request a refund</h2><p className="text-sm text-black/60">Requests are reviewed by the store. Submitting this form does not issue a payment refund.</p><label className="block text-sm font-bold">Order number<input name="orderNumber" required maxLength={128} className={field} /></label><label className="block text-sm font-bold">Reason<textarea name="reason" required minLength={10} maxLength={2000} rows={4} className={field} /></label>{result.message && <p role="alert" className="text-sm text-red-700">{result.message}</p>}<button disabled={pending} className="rounded-full bg-[#06472f] px-6 py-3 text-sm font-bold text-white disabled:opacity-50">{pending ? "Submitting…" : "Submit request"}</button></form>;
}
