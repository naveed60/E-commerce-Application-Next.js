import { prisma } from "@/lib/prisma";
import { formatMinorPkr } from "@/lib/utils";
import { fulfillOrder } from "../actions";

export const dynamic = "force-dynamic";
export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, customerName: true, customerEmail: true, customerPhone: true, shippingAddress: true, items: { select: { id: true, name: true, color: true, size: true, sku: true, quantity: true, lineTotalMinor: true } }, status: true, paymentStatus: true, totalMinor: true, createdAt: true } });
  return <div><p className="text-sm text-[var(--admin-text-soft)]">Customer purchases and payment status</p><h1 className="mt-1 font-serif text-5xl">Orders</h1><div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]"><table className="w-full text-left text-sm"><thead className="border-b border-[var(--admin-border)] text-xs uppercase text-[var(--admin-text-soft)]"><tr>{["Order", "Customer", "Date", "Order status", "Payment", "Total", "Action"].map((label) => <th className="px-5 py-4" key={label}>{label}</th>)}</tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-b border-[var(--admin-border)]"><td className="px-5 py-4 font-semibold">{order.orderNumber}</td><td className="px-5 py-4">{order.customerName || order.customerEmail || "—"}<details className="mt-2 text-xs"><summary className="cursor-pointer">Order details</summary><div className="mt-2 space-y-2"><p>{order.customerEmail}</p><p>{order.customerPhone}</p><p>{deliveryAddress(order.shippingAddress)}</p><ul>{order.items.map((item) => <li key={item.id}>{[item.name || "Product", item.color, item.size, item.sku].filter(Boolean).join(" / ")} × {item.quantity}{item.lineTotalMinor !== null && ` · ${formatMinorPkr(item.lineTotalMinor)}`}</li>)}</ul></div></details></td><td className="whitespace-nowrap px-5 py-4">{order.createdAt.toISOString().slice(0, 10)}</td><td className="px-5 py-4">{order.status}</td><td className="px-5 py-4">{order.paymentStatus}</td><td className="whitespace-nowrap px-5 py-4">{formatMinorPkr(order.totalMinor)}</td><td className="whitespace-nowrap px-5 py-4">{order.status === "PAID" && order.paymentStatus === "PAID" && <form action={fulfillOrder}><input type="hidden" name="id" value={order.id} /><button className="rounded-full border border-[var(--admin-border)] px-4 py-2 text-xs font-semibold">Mark fulfilled</button></form>}</td></tr>)}</tbody></table>{!orders.length && <p className="p-6 text-sm text-[var(--admin-text-soft)]">No orders yet.</p>}</div></div>;
}

function deliveryAddress(value: unknown): string {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  const address = value as Record<string, unknown>;
  return ["line1", "line2", "city", "province", "postalCode", "country"]
    .map((key) => address[key])
    .filter((part): part is string => typeof part === "string" && part.length > 0)
    .join(", ");
}
