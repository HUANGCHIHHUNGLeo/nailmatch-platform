export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-white/80 px-4 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 rounded bg-gray-200" />
          <div className="h-5 w-24 rounded bg-gray-200" />
        </div>
        <div className="h-9 w-20 rounded-lg bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl p-4">
        {/* Portfolio grid */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border bg-white">
              <div className="aspect-square animate-pulse bg-gray-200" />
              <div className="space-y-1.5 p-3">
                <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
