"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Clock } from "lucide-react";
import { useLiff } from "@/lib/line/liff";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";

type GateState = "loading" | "not_logged_in" | "not_registered" | "pending" | "verified";

export default function ArtistGatePage() {
  const router = useRouter();
  const { isReady, isLoggedIn } = useLiff();
  const { authFetch } = useAuthFetch();
  const [state, setState] = useState<GateState>("loading");

  useEffect(() => {
    if (!isReady) return;

    // Not logged in via LINE
    if (!isLoggedIn) {
      setState("not_logged_in");
      return;
    }

    // Logged in — check if registered
    async function checkArtist() {
      try {
        const res = await authFetch("/api/artists/me");
        if (res.ok) {
          const data = await res.json();
          if (data.is_verified) {
            setState("verified");
            router.replace("/artist/dashboard");
          } else {
            setState("pending");
          }
        } else {
          setState("not_registered");
        }
      } catch {
        setState("not_registered");
      }
    }

    checkArtist();
  }, [isReady, isLoggedIn, authFetch, router]);

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
          <p className="text-sm text-gray-500">確認身份中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-[var(--brand-lighter)] to-white">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-[var(--brand)]">
            <Image src="/logo.png" alt="NaLi Match" width={28} height={28} className="rounded" />
            NaLi Match
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-light)]">
            <Image src="/logo.png" alt="NaLi Match" width={48} height={48} className="rounded-lg" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">美甲・美睫師專區</h1>
          <p className="mt-2 text-gray-500">
            加入 NaLi Match，讓顧客主動找上門
          </p>
        </div>

        <div className="w-full space-y-4">
          {/* Not logged in */}
          {state === "not_logged_in" && (
            <>
              <Card className="transition hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-light)]">
                      <UserPlus className="h-6 w-6 text-[var(--brand)]" />
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900">我要註冊成為設計師</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        填寫資料、設定服務，開始接收顧客需求
                      </p>
                      <Button asChild className="mt-3 w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]">
                        <Link href="/line/liff/artist-form">立即註冊</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="transition hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                      <svg className="h-6 w-6 text-[#06C755]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h2 className="font-semibold text-gray-900">已註冊？用 LINE 登入</h2>
                      <p className="mt-1 text-sm text-gray-500">
                        使用您註冊時的 LINE 帳號登入後台
                      </p>
                      <Button
                        className="mt-3 w-full bg-[#06C755] text-white hover:bg-[#05b04c]"
                        onClick={() => {
                          const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
                          if (liffId) {
                            window.location.href = `https://liff.line.me/${liffId}/artist-form`;
                          }
                        }}
                      >
                        LINE 登入
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Pending verification */}
          {state === "pending" && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">審核中</h2>
                <p className="mt-2 text-gray-600">
                  您的申請已送出，我們正在審核您的資料。
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  審核通過後會透過 LINE 通知您，届時即可登入後台。
                </p>
              </CardContent>
            </Card>
          )}

          {/* Not registered (logged in but no artist record) */}
          {state === "not_registered" && (
            <Card className="transition hover:shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--brand-light)]">
                    <UserPlus className="h-6 w-6 text-[var(--brand)]" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900">完成設計師註冊</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      您已用 LINE 登入，請填寫資料完成註冊
                    </p>
                    <Button asChild className="mt-3 w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]">
                      <Link href="/line/liff/artist-form">填寫註冊資料</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
