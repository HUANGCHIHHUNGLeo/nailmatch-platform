"use client";

import { useRouter } from "next/navigation";
import { MultiStepForm } from "@/components/forms/MultiStepForm";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export default function RequestPage() {
  const router = useRouter();

  const handleSubmit = async (data: ServiceRequestFormData) => {
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
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

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="text-lg font-semibold text-[var(--brand)]">NaLi Match</h1>
        </div>
      </header>

      {/* LINE Guidance Banner */}
      {liffUrl && (
        <div className="mx-auto max-w-lg px-4 pt-4">
          <a
            href={liffUrl}
            className="flex items-center gap-3 rounded-xl bg-[#06C755] p-3 text-white shadow-sm transition hover:bg-[#05b34d]"
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
          </a>
        </div>
      )}

      {/* Form */}
      <main className="px-4 py-8">
        <MultiStepForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
