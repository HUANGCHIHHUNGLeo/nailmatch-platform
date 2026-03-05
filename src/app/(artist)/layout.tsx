"use client";

import { LiffProvider } from "@/lib/line/liff";

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LiffProvider>{children}</LiffProvider>;
}
