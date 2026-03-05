"use client";

import { useRouter } from "next/navigation";
import { LiffProvider, useLiff } from "@/lib/line/liff";
import { MultiStepForm } from "@/components/forms/MultiStepForm";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

function CustomerFormContent() {
  const router = useRouter();
  const { liff, isReady, isLoggedIn, profile, error } = useLiff();

  const handleSubmit = async (data: ServiceRequestFormData) => {
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(liff && isLoggedIn
            ? { Authorization: `Bearer ${liff.getIDToken()}` }
            : {}),
        },
        body: JSON.stringify({
          ...data,
          lineProfile: profile,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit request");

      const result = await response.json();

      // Send confirmation message in LINE chat
      if (liff?.isInClient()) {
        await liff.sendMessages([
          {
            type: "text",
            text: `美甲需求已送出！\n\n服務項目：${data.services.join("、")}\n預算：${data.budgetRange}\n\n系統正在為您配對合適的美甲師，請稍候...`,
          },
        ]);
        liff.closeWindow();
      } else {
        router.push(`/request/${result.id}`);
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("送出失敗，請重試");
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-light)] border-t-[var(--brand)]" />
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-500">載入失敗</p>
          <p className="mt-1 text-sm text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-[var(--brand)]">NaLi Match</h1>
          {profile && (
            <span className="text-sm text-gray-500">
              {profile.displayName}
            </span>
          )}
        </div>
      </header>

      <main className="px-4 py-8">
        <MultiStepForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
}

export default function LiffCustomerForm() {
  return (
    <LiffProvider>
      <CustomerFormContent />
    </LiffProvider>
  );
}
