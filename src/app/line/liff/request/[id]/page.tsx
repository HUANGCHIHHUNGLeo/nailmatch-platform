"use client";

import { LiffProvider } from "@/lib/line/liff";
import RequestDetailPage from "@/app/(customer)/request/[id]/page";

export default function LiffRequestDetailPage() {
  return (
    <LiffProvider>
      <RequestDetailPage />
    </LiffProvider>
  );
}
