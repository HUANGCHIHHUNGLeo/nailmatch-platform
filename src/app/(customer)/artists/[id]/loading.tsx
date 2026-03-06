"use client";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
        <p className="text-sm text-gray-400">載入中...</p>
      </div>
    </div>
  );
}
