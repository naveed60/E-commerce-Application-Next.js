import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export default async function AdminCustomersPage() {
  const customers = await prisma.user.findMany({ where: { role: "USER" }, orderBy: { createdAt: "desc" }, select: { id: true, name: true, email: true, createdAt: true, _count: { select: { orders: true } } } });
  return <div><p className="text-sm text-[var(--admin-text-soft)]">People who shop with you</p><h1 className="mt-1 font-serif text-5xl">Customers</h1><div className="mt-8 overflow-x-auto rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)]"><table className="w-full text-left text-sm"><thead className="border-b border-[var(--admin-border)] text-xs uppercase text-[var(--admin-text-soft)]"><tr>{["Name", "Email", "Orders", "Joined"].map((label) => <th className="px-5 py-4" key={label}>{label}</th>)}</tr></thead><tbody>{customers.map((customer) => <tr key={customer.id} className="border-b border-[var(--admin-border)]"><td className="px-5 py-4 font-semibold">{customer.name || "—"}</td><td className="px-5 py-4">{customer.email}</td><td className="px-5 py-4">{customer._count.orders}</td><td className="px-5 py-4">{customer.createdAt.toISOString().slice(0, 10)}</td></tr>)}</tbody></table>{!customers.length && <p className="p-6 text-sm text-[var(--admin-text-soft)]">No customers yet.</p>}</div></div>;
}
