"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CircleX } from "lucide-react";

export function CheckoutCancelClient({ orderId }: { orderId: string | null }) {
  useEffect(() => {
    if (!orderId) {
      return;
    }
    void fetch(`/api/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  }, [orderId]);

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl items-center px-6 py-12">
      <section className="w-full rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
        <CircleX className="mx-auto h-12 w-12 text-zinc-500" />
        <h1 className="mt-5 text-2xl font-semibold text-zinc-900">Checkout was cancelled</h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
          No order has been confirmed. You can return to your cart whenever you’re ready to try again.
        </p>
        <Link href="/nextshop/checkout" className="mt-8 inline-flex rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700">
          Return to checkout
        </Link>
      </section>
    </main>
  );
}
