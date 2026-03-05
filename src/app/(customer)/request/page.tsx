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

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="text-lg font-semibold text-[var(--brand)]">NaLi Match</h1>
        </div>
      </header>

      {/* Form */}
      <main className="px-4 py-8">
        <MultiStepForm onSubmit={handleSubmit} />
      </main>
    </div>
  );
}
