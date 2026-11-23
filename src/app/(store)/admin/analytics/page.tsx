import { prisma } from "@/lib/prisma";
import { formatMinorPkr } from "@/lib/utils";
export const dynamic = "force-dynamic";
export default async function AdminAnalyticsPage() {
  const [paid, fulfilled, pending] = await Promise.all([prisma.order.aggregate({ where: { paymentStatus: "PAID" }, _sum: { totalMinor: true }, _count: true }), prisma.order.count({ where: { status: "FULFILLED" } }), prisma.order.count({ where: { status: "PENDING" } })]);
  const stats = [{ label: "Paid orders", value: paid._count }, { label: "Paid revenue", value: formatMinorPkr(paid._sum.totalMinor ?? 0) }, { label: "Average paid order", value: formatMinorPkr(paid._count ? Math.round((paid._sum.totalMinor ?? 0) / paid._count) : 0) }, { label: "Fulfilled orders", value: fulfilled }, { label: "Pending orders", value: pending }];
  return <div><p className="text-sm text-[var(--admin-text-soft)]">Based on recorded orders</p><h1 className="mt-1 font-serif text-5xl">Analytics</h1><div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6"><p className="text-sm text-[var(--admin-text-soft)]">{stat.label}</p><p className="mt-3 text-2xl font-bold">{stat.value}</p></div>)}</div></div>;
}
