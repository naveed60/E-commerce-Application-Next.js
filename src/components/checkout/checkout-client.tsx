"use client";

import { FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { LoaderCircle, LockKeyhole } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

type CheckoutResponse = {
  checkoutUrl: string;
};

export function CheckoutClient({ customerName }: { customerName: string }) {
  const { items, total } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idempotencyKey = useRef<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length || isSubmitting) {
      return;
    }

    const form = new FormData(event.currentTarget);
    const key = idempotencyKey.current ?? crypto.randomUUID();
    idempotencyKey.current = key;
    setError(null);
    setIsSubmitting(true);

    const payload = {
      idempotencyKey: key,
      customerName: String(form.get("customerName") ?? "").trim(),
      customerPhone: String(form.get("customerPhone") ?? "").trim(),
      shippingAddress: {
        line1: String(form.get("line1") ?? "").trim(),
        line2: String(form.get("line2") ?? "").trim() || undefined,
        city: String(form.get("city") ?? "").trim(),
        province: String(form.get("province") ?? "").trim() || undefined,
        postalCode: String(form.get("postalCode") ?? "").trim() || undefined,
        country: "PK" as const,
      },
      items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
    };

    try {
      const response = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as
        | (CheckoutResponse & { message?: string; code?: string })
        | null;
      if (!response.ok || !body?.checkoutUrl) {
        const message = body?.message ?? "Unable to start checkout. Please try again.";
        setError(message);
        if (body?.code !== "SAFEPAY_RECONCILIATION_REQUIRED" && body?.code !== "CHECKOUT_RECONCILING") {
          idempotencyKey.current = null;
        }
        return;
      }

      window.location.assign(body.checkoutUrl);
    } catch {
      setError("Your connection was interrupted. Please try again.");
      idempotencyKey.current = null;
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!items.length) {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-semibold text-zinc-900">Your cart is empty</h1>
        <p className="mt-3 text-zinc-500">Add products before starting checkout.</p>
        <Link href="/nextshop" className="mt-6 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white">
          Continue shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-white">
          <LockKeyhole className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900">Secure checkout</p>
          <p className="text-xs text-zinc-500">Payment details are collected securely by Safepay.</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={submit} className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="text-2xl font-semibold text-zinc-900">Delivery details</h1>
          <p className="mt-2 text-sm text-zinc-500">We use this information to prepare and deliver your order.</p>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field label="Full name" name="customerName" defaultValue={customerName} required className="sm:col-span-2" />
            <Field label="Phone number" name="customerPhone" placeholder="+923001234567" required />
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
              <p className="text-xs font-medium text-zinc-500">Country</p>
              <p className="mt-1 text-sm font-medium text-zinc-800">Pakistan</p>
            </div>
            <Field label="Address" name="line1" required className="sm:col-span-2" />
            <Field label="Apartment, suite, etc. (optional)" name="line2" className="sm:col-span-2" />
            <Field label="City" name="city" required />
            <Field label="Province (optional)" name="province" />
            <Field label="Postal code (optional)" name="postalCode" />
          </div>

          {error && (
            <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          <Button type="submit" variant="primary" className="mt-8 w-full" disabled={isSubmitting}>
            {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? "Opening secure payment…" : `Pay ${formatPrice(total)} with Safepay`}
          </Button>
          <p className="mt-4 text-center text-xs leading-5 text-zinc-500">
            You will be redirected to Safepay to complete your payment. Your order is confirmed only after we receive Safepay’s secure payment confirmation.
          </p>
        </form>

        <aside className="h-fit rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
          <h2 className="text-lg font-semibold text-zinc-900">Order summary</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium text-zinc-800">{item.name}</p>
                  <p className="mt-1 text-zinc-500">Qty {item.quantity}</p>
                </div>
                <p className="shrink-0 font-medium text-zinc-800">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center justify-between border-t border-zinc-200 pt-5 text-base font-semibold text-zinc-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Link href="/nextshop" className="mt-5 inline-block text-sm font-medium text-zinc-600 underline underline-offset-4 hover:text-zinc-900">
            Edit cart
          </Link>
        </aside>
      </div>
    </main>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-zinc-700">{label}</span>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-zinc-900"
      />
    </label>
  );
}
