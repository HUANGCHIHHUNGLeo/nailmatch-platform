"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";
import { useLiff } from "@/lib/line/liff";

interface ArtistProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  services: string[];
  styles: string[];
  cities: string[];
  min_price: number | null;
  max_price: number | null;
  gender: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  instagram_handle: string | null;
  is_active: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isReady, isLoggedIn } = useLiff();
  const { authFetch } = useAuthFetch();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isReady || !isLoggedIn) return;
    authFetch("/api/artists/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady, isLoggedIn, authFetch]);

  const handleToggleActive = async () => {
    if (!profile) return;
    const newActive = !profile.is_active;
    const confirmMsg = newActive
      ? "確定要恢復接單嗎？"
      : "暫停接單後，你不會收到新的配對需求。確定要暫停嗎？";
    if (!confirm(confirmMsg)) return;

    setToggling(true);
    try {
      const res = await authFetch("/api/artists/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: newActive }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
      } else {
        alert("操作失敗，請重試");
      }
    } catch {
      alert("網路錯誤，請檢查連線後重試");
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmFirst = confirm(
      "確定要刪除帳號嗎？\n\n刪除後將無法復原，所有資料（個人檔案、作品集、報價紀錄）都會被永久移除。"
    );
    if (!confirmFirst) return;

    const confirmSecond = confirm(
      "再次確認：刪除帳號後無法復原。\n\n請輸入「確認」後按確定。"
    );
    if (!confirmSecond) return;

    setDeleting(true);
    try {
      const res = await authFetch("/api/artists/me", { method: "DELETE" });
      if (res.ok) {
        alert("帳號已成功刪除");
        window.location.href = "/";
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "刪除失敗，請稍後再試");
      }
    } catch {
      alert("網路錯誤，請檢查連線後重試");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
      </div>
    );
  }

  if (!profile) {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    const liffUrl = liffId ? `https://liff.line.me/${liffId}/artist-form` : null;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-gray-900">無法載入資料</h2>
          <p className="mb-6 text-sm text-gray-500">
            請透過 LINE 重新登入後再進入設定頁面。
          </p>
          <div className="space-y-3">
            {liffUrl && (
              <button
                onClick={() => { window.location.href = liffUrl; }}
                className="w-full rounded-lg bg-[#06C755] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#05a647]"
              >
                用 LINE 重新登入
              </button>
            )}
            <button
              onClick={() => router.back()}
              className="w-full rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
            >
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500">
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回
          </button>
          <h1 className="text-lg font-semibold text-[var(--brand)]">設定</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {/* Account Info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 font-semibold">帳號資訊</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">名稱</span>
                <span>{profile?.display_name || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">電話</span>
                <span>{profile?.phone || "未設定"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span>{profile?.email || "未設定"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Instagram</span>
                <span>{profile?.instagram_handle ? `@${profile.instagram_handle}` : "未設定"}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
              <Link href="/artist/profile">編輯個人檔案</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Service Summary */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 font-semibold">服務概覽</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">服務地區</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {profile?.cities && profile.cities.length > 0 ? (
                    profile.cities.map((c) => (
                      <Badge key={c} variant="secondary" className="text-xs">
                        {c}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">未設定</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">服務項目</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {profile?.services && profile.services.length > 0 ? (
                    profile.services.map((s) => (
                      <Badge key={s} variant="secondary" className="text-xs">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-400">未設定</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500">價格範圍</p>
                <p className="text-sm">
                  {profile?.min_price && profile?.max_price
                    ? `NT$${profile.min_price.toLocaleString()} — NT$${profile.max_price.toLocaleString()}`
                    : "未設定"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card>
          <CardContent className="space-y-2 p-4">
            <h2 className="mb-1 font-semibold">管理</h2>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/artist/portfolio">管理作品集</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/artist/availability">時段管理</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/artist/bookings">預約紀錄</Link>
            </Button>
            <Button variant="ghost" className="w-full justify-start" asChild>
              <Link href="/artist/report">業績報表</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pause/Resume Service */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-2 font-semibold">接單狀態</h2>
            <p className="mb-3 text-sm text-gray-500">
              {profile?.is_active
                ? "目前正在接單中，暫停後不會收到新的配對需求"
                : "目前已暫停接單，恢復後才會收到新的配對需求"}
            </p>
            <Button
              variant="outline"
              className={`w-full ${
                profile?.is_active
                  ? "text-red-500 hover:bg-red-50 hover:text-red-600"
                  : "text-green-600 hover:bg-green-50 hover:text-green-700"
              }`}
              onClick={handleToggleActive}
              disabled={toggling}
            >
              {toggling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {profile?.is_active ? "暫停接單" : "恢復接單"}
            </Button>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-100">
          <CardContent className="p-4">
            <h2 className="mb-2 font-semibold text-red-600">刪除帳號</h2>
            <p className="mb-3 text-sm text-gray-500">
              刪除後所有資料將被永久移除，包含個人檔案、作品集、報價紀錄，且無法復原。
            </p>
            <Button
              variant="outline"
              className="w-full border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              刪除我的帳號
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
