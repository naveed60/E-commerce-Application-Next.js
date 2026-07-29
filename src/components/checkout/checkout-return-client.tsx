"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Clock3, LoaderCircle, TriangleAlert } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { formatMinorPkr } from "@/lib/utils";

type OrderState = {
  orderNumber: string;
  status: "PENDING" | "PAID" | "FULFILLED" | "CANCELLED";
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED" | "DISPUTED" | "REVIEW";
  totalMinor: number;
  currency: string;
};

export function CheckoutReturnClient({ orderId }: { orderId: string | null }) {
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cleared = useRef(false);

  useEffect(() => {
    if (!orderId) {
      setError("This payment return link is incomplete.");
      return;
    }
    const currentOrderId = orderId;

    let cancelled = false;
    async function fetchStatus() {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(currentOrderId)}/status`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("We could not retrieve this order.");
        }
        const data = (await response.json()) as OrderState;
        if (!cancelled) {
          setOrder(data);
          setError(null);
          if (data.paymentStatus === "PAID" && !cleared.current) {
            cleared.current = true;
            clearCart();
          }
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError instanceof Error ? fetchError.message : "We could not retrieve this order.");
        }
      }
    }

    void fetchStatus();
    const timer = window.setInterval(fetchStatus, 3_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [clearCart, orderId]);

  const isPaid = order?.paymentStatus === "PAID";
  const needsReview = order?.paymentStatus === "REVIEW";
  const expired = order?.paymentStatus === "EXPIRED" || order?.paymentStatus === "FAILED";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        {isPaid ? (
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        ) : needsReview || expired || error ? (
          <TriangleAlert className="mx-auto h-12 w-12 text-amber-500" />
        ) : (
          <LoaderCircle className="mx-auto h-12 w-12 animate-spin text-zinc-700" />
        )}

        <h1 className="mt-5 text-2xl font-semibold text-zinc-900">
          {isPaid
            ? "Payment confirmed"
            : needsReview
              ? "Your payment needs review"
              : expired
                ? "This payment session has expired"
                : error
                  ? "We’re unable to confirm your payment"
                  : "Confirming your payment"}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
          {isPaid
            ? "Your order has been confirmed and a receipt is on its way to your email address."
            : needsReview
              ? "We received a payment update that needs a manual check. Please contact support before trying again."
              : expired
                ? "No payment was confirmed before the checkout session expired. You can return to the store and start a new checkout."
                : error
                  ? error
                  : "Safepay has returned you to the store. We’ll update this page automatically when its signed payment confirmation arrives."}
        </p>

        {order && (
          <div className="mx-auto mt-7 max-w-sm rounded-2xl bg-zinc-50 px-5 py-4 text-left text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-zinc-500">Order</span>
              <span className="font-semibold text-zinc-900">{order.orderNumber}</span>
            </div>
            <div className="mt-3 flex justify-between gap-4">
              <span className="text-zinc-500">Total</span>
              <span className="font-semibold text-zinc-900">{formatMinorPkr(order.totalMinor)}</span>
            </div>
          </div>
        )}

        {!isPaid && !needsReview && !expired && !error && (
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <Clock3 className="h-3.5 w-3.5" />
            This usually takes only a few seconds.
          </div>
        )}

        <Link href="/nextshop" className="mt-8 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700">
          Continue shopping
        </Link>
      </section>
    </main>
  );
}
