"use client";

import { LiffProvider, useLiff } from "@/lib/line/liff";
import DashboardContent from "@/components/artist/DashboardContent";

function ArtistLiffGate() {
  const { isReady, isLoggedIn, needsLogin, error } = useLiff();

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
          <p className="text-sm text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  if (error || needsLogin || !isLoggedIn) {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-gray-900">設計師後台</h2>
          <p className="mb-6 text-sm text-gray-500">
            請透過 LINE 登入以使用設計師後台。
          </p>
          <div className="space-y-3">
            {liffId && (
              <a
                href={`https://liff.line.me/${liffId}/artist`}
                className="block w-full rounded-lg bg-[#06C755] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#05a647]"
              >
                用 LINE 重新開啟
              </a>
            )}
            <a
              href="/artist"
              className="block rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              前往設計師專區
            </a>
          </div>
          {error && (
            <p className="mt-4 text-xs text-gray-400">錯誤：{error.message}</p>
          )}
        </div>
      </div>
    );
  }

  return <DashboardContent />;
}

export default function LiffArtistPage() {
  return (
    <LiffProvider requireLogin>
      <ArtistLiffGate />
    </LiffProvider>
  );
}
