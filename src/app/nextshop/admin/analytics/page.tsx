export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]">
          Insights
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
          Analytics
        </h1>
        <p className="mt-2 text-sm text-[var(--admin-text-soft)]">
          Performance summaries and pipeline metrics will live here once the
          analytics feed is connected.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {["Sessions", "Conversion rate", "AOV"].map((metric) => (
          <div
            key={metric}
            className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]">
              {metric}
            </p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
              {metric === "Conversion rate" ? "4.1%" : "–"}
            </p>
            <p className="mt-2 text-sm text-[var(--admin-text-soft)]">
              Data sync is on the roadmap; this card will show live performance
              once the next data pipeline ships.
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
