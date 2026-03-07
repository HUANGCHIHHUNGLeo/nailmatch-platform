"use client";

import { LiffProvider } from "@/lib/line/liff";
import MyPageContent from "@/components/customer/MyPageContent";

export default function LiffMyPage() {
  return (
    <LiffProvider requireLogin>
      <MyPageContent />
    </LiffProvider>
  );
}
