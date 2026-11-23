"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useSession } from "next-auth/react";
import { formatMinorPkr } from "@/lib/utils";

type Order = { orderNumber: string; status: string; paymentStatus: string; totalMinor: number };
export function OrderLookup() {
  const { status } = useSession();
  const [number, setNumber] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setOrder(null); setLoading(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(number.trim())}/status`, { cache: "no-store" });
      if (!response.ok) { setError(response.status === 401 ? "Please sign in to view your order." : response.status === 404 ? "We could not find that order in your account." : "Unable to retrieve your order. Please try again."); return; }
      setOrder(await response.json());
    } catch { setError("Unable to retrieve your order. Please try again."); } finally { setLoading(false); }
  }
  if (status === "loading") return <p className="mt-8 text-sm">Loading…</p>;
  if (status !== "authenticated") return <Link href="/login?redirect=/info/track-order" className="mt-8 inline-flex rounded-full bg-[#06472f] px-7 py-3 text-sm font-bold text-white">Sign in to track your order</Link>;
  return <><form onSubmit={lookup} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="order-number">Order number</label><input id="order-number" required value={number} onChange={(e) => setNumber(e.target.value)} placeholder="Order number" className="min-w-0 flex-1 rounded-full border border-black/15 bg-white px-5 py-4 text-sm" /><button disabled={loading} className="rounded-full bg-[#06472f] px-7 py-4 text-sm font-bold text-white disabled:opacity-60">{loading ? "Checking…" : "Track order"}</button></form>{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}{order && <div className="mt-6 max-w-xl rounded-2xl bg-white p-6 text-sm"><p className="font-bold">Order {order.orderNumber}</p><p className="mt-3">Order status: {order.status.replaceAll("_", " ")}</p><p className="mt-2">Payment status: {order.paymentStatus.replaceAll("_", " ")}</p><p className="mt-2">Total: {formatMinorPkr(order.totalMinor)}</p></div>}</>;
}
