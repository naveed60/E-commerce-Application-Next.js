export default function AdminOrdersPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]">
          Order intelligence
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
          Orders
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Pending", value: "24", tone: "text-amber-500" },
          { label: "Shipped", value: "118", tone: "text-emerald-500" },
          { label: "Returned", value: "6", tone: "text-rose-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-5 text-sm text-[var(--admin-text-soft)] shadow-[var(--admin-shadow)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]">
              {stat.label}
            </p>
            <p className={`mt-3 text-2xl font-semibold tracking-tight text-[var(--admin-text)] ${stat.tone}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>
      <div className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow)]">
        <p className="text-sm text-[var(--admin-text-soft)]">
          The order table integration is coming Soon. For now, review the
          operational summaries above, and head back to the overview for
          live order insights.
        </p>
      </div>
    </div>
  );
}
