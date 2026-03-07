"use client";

import { LiffProvider } from "@/lib/line/liff";
import BookingDetailPage from "@/app/(customer)/booking/[id]/page";

export default function LiffBookingDetailPage() {
  return (
    <LiffProvider>
      <BookingDetailPage />
    </LiffProvider>
  );
}
