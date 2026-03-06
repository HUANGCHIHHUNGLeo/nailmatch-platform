export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur">
        <div className="h-5 w-5 rounded bg-gray-200" />
        <div className="h-7 w-7 rounded-full bg-gray-200" />
        <div className="h-5 w-20 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Profile header card */}
        <div className="rounded-xl border bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="h-20 w-20 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          </div>
          <div className="mt-4 flex gap-3">
            <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-9 w-28 animate-pulse rounded-lg bg-gray-100" />
          </div>
        </div>

        {/* Location card */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
            ))}
          </div>
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-100" />
        </div>

        {/* Services card */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-6 w-20 animate-pulse rounded-full bg-gray-100" />
            ))}
          </div>
        </div>

        {/* Portfolio grid */}
        <div className="space-y-3">
          <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-200" />
            ))}
          </div>
        </div>

        {/* CTA button */}
        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
