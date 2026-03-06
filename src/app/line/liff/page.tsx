"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LiffProvider, useLiff } from "@/lib/line/liff";

function LiffLandingContent() {
  const router = useRouter();
  const { liff, isReady } = useLiff();

  useEffect(() => {
    if (!isReady) return;

    // If opened inside LINE, close the window
    if (liff?.isInClient()) {
      liff.closeWindow();
    } else {
      // In external browser, redirect to homepage
      router.replace("/");
    }
  }, [isReady, liff, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-light)] border-t-[var(--brand)]" />
        <p className="text-gray-500">載入中...</p>
      </div>
    </div>
  );
}

export default function LiffLandingPage() {
  return (
    <LiffProvider>
      <LiffLandingContent />
    </LiffProvider>
  );
}
