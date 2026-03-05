export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
        <p className="text-gray-500">載入中...</p>
      </div>
    </div>
  );
}
