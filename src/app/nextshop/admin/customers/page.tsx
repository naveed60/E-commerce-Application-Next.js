export default function AdminCustomersPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]">
          Community
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
          Customers
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow)]"
          >
            <h2 className="text-lg font-semibold text-[var(--admin-text)]">
              Segment {index + 1}
            </h2>
            <p className="mt-2 text-sm text-[var(--admin-text-soft)]">
              Customer cohorts, loyalty tiers, and outreach automation will
              surface here. For now, use the session data and analytics to scope
              your next drop.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
