export default function Loading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-white/80 px-4 backdrop-blur">
        <div className="h-5 w-5 rounded bg-gray-200" />
        <div className="h-5 w-24 rounded bg-gray-200" />
      </div>

      <div className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Avatar + name */}
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-white p-6">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-20 animate-pulse rounded bg-gray-100" />
        </div>

        {/* Form fields */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100" />
          </div>
        ))}

        {/* Checkbox group */}
        <div className="space-y-2">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-gray-100" />
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="h-12 w-full animate-pulse rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
