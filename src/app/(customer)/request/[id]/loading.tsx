export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur">
        <div className="h-5 w-5 rounded bg-gray-200" />
        <div className="h-5 w-24 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Status + service badges */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-1.5">
              {[1, 2].map((i) => (
                <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
              ))}
            </div>
            <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
          </div>
          <div className="mt-3 space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>

        {/* Quotes section */}
        <div className="space-y-3">
          <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
          {[1, 2].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
              <div className="mt-3 flex gap-2">
                <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-200" />
                <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
