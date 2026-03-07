"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LiffProvider, useLiff } from "@/lib/line/liff";

function ArtistRedirect() {
  const router = useRouter();
  const { isReady, isLoggedIn } = useLiff();

  useEffect(() => {
    if (isReady && isLoggedIn) {
      router.replace("/artist/dashboard");
    }
  }, [isReady, isLoggedIn, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
      <div className="text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
        <p className="text-sm text-gray-500">正在前往設計師後台...</p>
      </div>
    </div>
  );
}

export default function LiffArtistPage() {
  return (
    <LiffProvider requireLogin>
      <ArtistRedirect />
    </LiffProvider>
  );
}
