export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur">
        <div className="h-7 w-7 rounded-full bg-gray-200" />
        <div className="h-5 w-20 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Profile card */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-3 w-32 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
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
                <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
            </div>
          </div>
        ))}

        {/* Bottom CTA */}
        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
