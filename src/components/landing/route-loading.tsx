import { StorefrontShell } from "./storefront-shell";

export function CatalogLoading({ title }: { title: string }) {
  return (
    <StorefrontShell>
      <main aria-busy="true" aria-label={`Loading ${title}`} className="mx-auto min-h-[60vh] max-w-[1320px] px-5 py-12 md:px-10">
        <p role="status" className="sr-only">Loading products…</p>
        <div aria-hidden="true" className="h-4 w-28 animate-pulse rounded bg-black/10" />
        <div className="mt-8 h-12 w-2/3 animate-pulse rounded bg-black/10" />
        <div className="mt-4 h-6 max-w-3xl animate-pulse rounded bg-black/10" />
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} aria-hidden="true" className="animate-pulse">
              <div className="aspect-[.82] rounded-xl bg-[#eeeae5]" />
              <div className="mt-3 h-5 w-3/4 rounded bg-black/10" />
              <div className="mt-2 h-4 w-1/3 rounded bg-black/10" />
            </div>
          ))}
        </div>
      </main>
    </StorefrontShell>
  );
}

export function ProductLoading() {
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
