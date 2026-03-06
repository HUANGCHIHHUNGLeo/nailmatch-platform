export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur">
        <div className="h-5 w-5 rounded bg-gray-200" />
        <div className="h-5 w-24 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl space-y-3 p-4">
        {/* Filter tabs */}
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-16 animate-pulse rounded-full bg-gray-200" />
          ))}
        </div>

        {/* Booking cards */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="h-5 w-14 animate-pulse rounded-full bg-gray-100" />
                </div>
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t pt-3">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
              <div className="h-4 w-16 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
