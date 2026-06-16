export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 pb-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[var(--admin-text-muted)]">
          System
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--admin-text)]">
          Settings
        </h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--admin-text)]">Appearance</h2>
          <p className="mt-2 text-sm text-[var(--admin-text-soft)]">
            Customize the admin skin, notification cadence, and housekeeping
            preferences before launch.
          </p>
        </div>
        <div className="rounded-[28px] border border-[var(--admin-border)] bg-[var(--admin-bg-elevated)] p-6 shadow-[var(--admin-shadow)]">
          <h2 className="text-lg font-semibold text-[var(--admin-text)]">Security</h2>
          <p className="mt-2 text-sm text-[var(--admin-text-soft)]">
            Enable multi-factor auth, control session durations, and manage role
            assignments for collaborators.
          </p>
        </div>
      </div>
    </div>
  );
}
