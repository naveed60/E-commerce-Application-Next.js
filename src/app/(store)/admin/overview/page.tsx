import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatMinorPkr } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function AdminOverviewPage() {
  const [orderCount, productCount, customerCount, paidOrders, recentOrders] = await Promise.all([
    prisma.order.count(), prisma.product.count({ where: { archived: false } }), prisma.user.count({ where: { role: "USER" } }),
    prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalMinor: true } }),
    prisma.order.findMany({ take: 8, orderBy: { createdAt: "desc" }, select: { id: true, orderNumber: true, customerName: true, customerEmail: true, status: true, paymentStatus: true, totalMinor: true, createdAt: true } }),
  ]);
  const stats = [{ label: "Paid sales", value: formatMinorPkr(paidOrders._sum.totalMinor ?? 0) }, { label: "Orders", value: orderCount }, { label: "Products", value: productCount }, { label: "Customers", value: customerCount }];
  return <div className="space-y-8"><div><p className="text-sm text-[var(--admin-text-soft)]">Your store at a glance</p><h1 className="mt-1 font-serif text-5xl text-[var(--admin-text)]">Overview</h1></div><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6"><p className="text-sm text-[var(--admin-text-soft)]">{stat.label}</p><p className="mt-3 text-2xl font-bold">{stat.value}</p></div>)}</section><section className="overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]"><div className="flex items-center justify-between p-6"><h2 className="font-serif text-3xl">Recent orders</h2><Link href="/admin/orders" className="text-sm font-semibold text-[var(--admin-accent)]">View all</Link></div><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="border-y border-[var(--admin-border)] text-xs uppercase text-[var(--admin-text-soft)]"><tr><th className="px-6 py-3">Order</th><th className="px-6 py-3">Customer</th><th className="px-6 py-3">Payment</th><th className="px-6 py-3">Total</th></tr></thead><tbody>{recentOrders.map((order) => <tr key={order.id} className="border-b border-[var(--admin-border)]"><td className="px-6 py-4 font-semibold">{order.orderNumber}</td><td className="px-6 py-4">{order.customerName || order.customerEmail || "—"}</td><td className="px-6 py-4">{order.paymentStatus}</td><td className="px-6 py-4">{formatMinorPkr(order.totalMinor)}</td></tr>)}</tbody></table>{!recentOrders.length && <p className="p-6 text-sm text-[var(--admin-text-soft)]">No orders yet.</p>}</div></section></div>;
}
