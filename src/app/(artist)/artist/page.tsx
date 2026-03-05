"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, UserPlus, LogIn } from "lucide-react";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";

export default function ArtistGatePage() {
  const router = useRouter();
  const { authFetch, isReady } = useAuthFetch();
  const [checking, setChecking] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (!isReady) return;

    async function checkArtist() {
      try {
        const res = await authFetch("/api/artists/me");
        if (res.ok) {
          // Already registered, go to dashboard
          router.replace("/artist/dashboard");
          return;
        }
      } catch {
        // Not registered
      }
      setIsRegistered(false);
      setChecking(false);
    }

    checkArtist();
  }, [isReady, authFetch, router]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
          <p className="text-sm text-gray-500">確認身份中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-pink-50 to-white">
      <header className="border-b bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-pink-500">
            <Sparkles className="h-5 w-5" />
            NaLi Match
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center p-6">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-pink-100">
            <Sparkles className="h-10 w-10 text-pink-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">美甲師專區</h1>
          <p className="mt-2 text-gray-500">
            加入 NaLi Match，讓顧客主動找上門
          </p>
        </div>

        <div className="w-full space-y-4">
          {/* Register */}
          <Card className="transition hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pink-100">
                  <UserPlus className="h-6 w-6 text-pink-500" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">我要註冊成為美甲師</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    填寫資料、設定服務，開始接收顧客需求
                  </p>
                  <Button asChild className="mt-3 w-full bg-pink-500 hover:bg-pink-600">
                    <Link href="/line/liff/artist-form">立即註冊</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Login (for artists who are already registered but accessed from browser) */}
          <Card className="transition hover:shadow-md">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <LogIn className="h-6 w-6 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold text-gray-900">我已經是美甲師</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    請從 LINE 官方帳號開啟，自動登入你的帳號
                  </p>
                  <Button asChild variant="outline" className="mt-3 w-full">
                    <Link href="/artist/dashboard">進入後台</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
