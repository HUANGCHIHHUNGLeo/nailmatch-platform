"use client";

import { useRouter } from "next/navigation";
import { LiffProvider, useLiff } from "@/lib/line/liff";
import { MultiStepForm } from "@/components/forms/MultiStepForm";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

function CustomerFormContent() {
  const router = useRouter();
  const { liff, isReady, isLoggedIn, needsLogin, profile, error } = useLiff();

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

  if (needsLogin || error) {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    const liffUrl = liffId ? `https://liff.line.me/${liffId}/customer-form` : null;
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg viewBox="0 0 24 24" className="h-9 w-9 text-green-500" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">請透過 LINE 開啟</h2>
          <p className="mb-6 text-sm text-gray-500">
            此表單需要透過 LINE 登入，才能在配對成功時即時通知您。
          </p>
          <div className="space-y-3">
            {(liff || liffUrl) && (
              <button
                onClick={() => {
                  if (liff) {
                    liff.login({ redirectUri: window.location.href });
                  } else if (liffUrl) {
                    window.location.href = liffUrl;
                  }
                }}
                className="w-full rounded-lg bg-[#06C755] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#05a647]"
              >
                用 LINE 開啟表單
              </button>
            )}
            <a
              href="/request"
              className="block rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              不登入，直接填寫需求
            </a>
            <a
              href="/"
              className="block text-sm text-gray-400 hover:text-gray-600"
            >
              回首頁
            </a>
          </div>
          {error && (
            <p className="mt-4 text-xs text-gray-400">錯誤資訊：{error.message}</p>
          )}
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
    <LiffProvider requireLogin>
      <CustomerFormContent />
    </LiffProvider>
  );
}
