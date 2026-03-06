export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/80 px-4 backdrop-blur">
        <div className="h-7 w-7 rounded-full bg-gray-200" />
        <div className="h-5 w-5 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Greeting */}
        <div className="h-7 w-40 animate-pulse rounded bg-gray-200" />

        {/* Stats grid 2x2 */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border bg-white p-4">
              <div className="h-8 w-12 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-3 w-16 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          <div className="h-9 flex-1 animate-pulse rounded-md bg-white" />
          <div className="h-9 flex-1 animate-pulse rounded-md bg-transparent" />
        </div>

        {/* Request cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl border bg-white p-4">
            <div className="flex flex-wrap gap-1.5">
              {[1, 2].map((j) => (
                <div key={j} className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-100" />
              <div className="h-9 flex-1 animate-pulse rounded-lg bg-gray-200" />
            </div>
          </div>
        ))}

        {/* Quick links grid */}
        <div className="grid grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 rounded-xl border bg-white p-3">
              <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
              <div className="h-3 w-10 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
