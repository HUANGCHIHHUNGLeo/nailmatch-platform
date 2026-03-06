"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";

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
  const { authFetch } = useAuthFetch();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    authFetch("/api/artists/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setProfile(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
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
      </main>
    </div>
  );
}
