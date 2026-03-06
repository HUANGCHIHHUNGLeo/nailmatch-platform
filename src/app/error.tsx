"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)] p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <span className="text-4xl text-red-400">!</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">發生錯誤</h1>
        <p className="mb-6 text-sm text-gray-500">
          很抱歉，頁面載入時發生問題。請重試或回到首頁。
        </p>
        <div className="space-y-3">
          <Button
            onClick={reset}
            className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
          >
            重試
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && error?.message && (
          <p className="mt-6 rounded-lg bg-gray-100 p-3 text-left text-xs text-gray-500 break-all">
            {error.message}
          </p>
        )}
      </div>
    </div>
  );
}
