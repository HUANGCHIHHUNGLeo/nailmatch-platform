export default function ReportLoading() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
          <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
          <div className="w-12" />
        </div>
      </header>
      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {/* 本月摘要 */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 h-5 w-20 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="mx-auto h-8 w-8 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto mt-1 h-3 w-16 animate-pulse rounded bg-gray-100" />
            </div>
            <div className="rounded-xl bg-gray-50 p-3">
              <div className="mx-auto h-8 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto mt-1 h-3 w-16 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        </div>
        {/* 累計數據 */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 h-5 w-20 animate-pulse rounded bg-gray-200" />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-1 h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                <div className="mx-auto h-5 w-12 animate-pulse rounded bg-gray-200" />
                <div className="mx-auto mt-1 h-3 w-16 animate-pulse rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
        {/* 月度明細 */}
        <div className="rounded-xl border bg-white p-4">
          <div className="mb-3 h-5 w-24 animate-pulse rounded bg-gray-200" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 p-3">
                <div>
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-100" />
                </div>
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
