export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur">
        <div className="h-7 w-7 rounded-full bg-gray-200" />
        <div className="h-5 w-24 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Reels carousel skeleton */}
        <div className="h-40 animate-pulse rounded-xl bg-gray-200" />

        {/* Filter buttons */}
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-gray-200" />
          ))}
        </div>

        {/* City filter */}
        <div className="flex gap-2 overflow-hidden">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-7 w-14 flex-shrink-0 animate-pulse rounded-full bg-gray-100" />
          ))}
        </div>

        {/* Count */}
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />

        {/* Artist cards grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-12 animate-pulse rounded-full bg-gray-100" />
                  </div>
                  <div className="h-3 w-28 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
              <div className="mt-3 flex gap-1.5">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-6 w-14 animate-pulse rounded-full bg-gray-100" />
                ))}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
