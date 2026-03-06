"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BookingsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/my");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
    </div>
  );
}
