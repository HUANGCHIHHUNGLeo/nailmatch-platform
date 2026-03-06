"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MultiStepForm } from "@/components/forms/MultiStepForm";
import { DirectBookingForm } from "@/components/forms/DirectBookingForm";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

interface ArtistInfo {
  id: string;
  display_name: string;
  avatar_url: string | null;
  cities: string[];
  services: string[];
  styles: string[];
  min_price: number | null;
  max_price: number | null;
}

function RequestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const artistId = searchParams.get("artistId");
  const [artist, setArtist] = useState<ArtistInfo | null>(null);

  useEffect(() => {
    if (!artistId) return;
    fetch(`/api/artists/${artistId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setArtist(data);
      })
      .catch(() => {});
  }, [artistId]);

  const handleSubmit = async (data: ServiceRequestFormData) => {
    try {
      const body: Record<string, unknown> = { ...data };
      if (artistId) body.preferredArtistId = artistId;

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      const result = await response.json();
      router.push(`/request/${result.id}`);
    } catch (error) {
      console.error("Submit error:", error);
      alert("送出失敗，請重試");
    }
  };

  const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
  const liffUrl = liffId
    ? `https://liff.line.me/${liffId}/customer-form`
    : null;

  // Direct booking: use simplified form
  if (artistId && artist) {
    return (
      <main className="px-4 py-6">
        <DirectBookingForm artist={artist} onSubmit={handleSubmit} />
      </main>
    );
  }

  // Loading artist data
  if (artistId && !artist) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  // General matching: use full multi-step form
  return (
    <>
      {/* LINE Guidance Banner */}
      {liffUrl && (
        <div className="mx-auto max-w-lg px-4 pt-4">
          <button
            onClick={() => { window.location.href = liffUrl; }}
            className="flex w-full items-center gap-3 rounded-xl bg-[#06C755] p-3 text-left text-white shadow-sm transition hover:bg-[#05b34d]"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg">
              L
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">透過 LINE 送出需求</p>
              <p className="text-xs text-white/80">
                即可收到即時報價通知，不錯過任何設計師的回覆！
              </p>
            </div>
            <span className="shrink-0 text-white/80">→</span>
          </button>
        </div>
      )}

      {/* Form */}
      <main className="px-4 py-8">
        <MultiStepForm onSubmit={handleSubmit} />
      </main>
    </>
  );
}

export default function RequestPage() {
  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="text-lg font-semibold text-[var(--brand)]">NaLi Match</h1>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="flex min-h-[50vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
          </div>
        }
      >
        <RequestContent />
      </Suspense>
    </div>
  );
}
