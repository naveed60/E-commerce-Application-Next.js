import { StorefrontShell } from "@/components/landing/storefront-shell";

export default function ProductLoading() {
  return (
    <StorefrontShell>
      <main aria-busy="true" aria-label="Loading product" className="mx-auto max-w-[1320px] px-5 pb-20 md:px-10">
        <p role="status" className="py-7 text-sm text-black/55">Loading product…</p>
        <div aria-hidden="true" className="grid animate-pulse gap-9 md:grid-cols-2 md:gap-16">
          <div className="aspect-[.82] rounded-3xl bg-[#eeeae5]" />
          <div className="space-y-7 py-8">
            <div className="h-5 w-24 rounded bg-black/10" />
            <div className="h-14 w-3/4 rounded bg-black/10" />
            <div className="h-8 w-32 rounded bg-black/10" />
            <div className="h-24 rounded bg-black/10" />
            <div className="h-14 rounded-full bg-black/10" />
          </div>
        </div>
      </main>
    </StorefrontShell>
  );
}
