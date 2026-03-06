export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur">
        <div className="h-5 w-5 rounded bg-gray-200" />
        <div className="h-5 w-24 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Status badge */}
        <div className="flex justify-center">
          <div className="h-8 w-24 animate-pulse rounded-full bg-gray-200" />
        </div>

        {/* Artist info card */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 flex-shrink-0 animate-pulse rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>

        {/* Booking details card */}
        <div className="rounded-xl border bg-white p-4 space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
            </div>
          ))}
        </div>

        {/* Price card */}
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="h-5 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
