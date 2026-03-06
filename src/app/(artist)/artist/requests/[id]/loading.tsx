export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur">
        <div className="h-5 w-5 rounded bg-gray-200" />
        <div className="h-5 w-24 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Request info card */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex flex-wrap gap-1.5">
            {[1, 2].map((i) => (
              <div key={i} className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
            ))}
          </div>
          <div className="mt-3 space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-36 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
          <div className="mt-3 h-4 w-full animate-pulse rounded bg-gray-100" />
        </div>

        {/* Quote form card */}
        <div className="rounded-xl border bg-white p-4 space-y-4">
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
          <div className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-24 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
          <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
