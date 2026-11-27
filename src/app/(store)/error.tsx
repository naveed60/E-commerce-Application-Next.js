"use client";

export default function StoreError({ reset }: { reset: () => void }) {
  return <main className="mx-auto min-h-[60vh] max-w-2xl px-6 py-24 text-center"><h1 className="text-3xl font-semibold">The store is temporarily unavailable</h1><p className="mt-4 text-black/60">We could not load the latest information. Please try again in a moment.</p><button type="button" onClick={reset} className="mt-6 rounded-full bg-[#06472f] px-6 py-3 font-semibold text-white">Try again</button></main>;
}
