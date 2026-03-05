"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LOCATIONS, NAIL_SERVICES, STYLES } from "@/lib/utils/constants";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";

interface ArtistProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  gender: string | null;
  cities: string[];
  service_location_type: string | null;
  studio_address: string | null;
  services: string[];
  styles: string[];
  min_price: number | null;
  max_price: number | null;
  instagram_handle: string | null;
}

export default function ArtistProfilePage() {
  const router = useRouter();
  const { authFetch } = useAuthFetch();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    authFetch("/api/artists/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage(null);

    try {
      const res = await authFetch("/api/artists/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: profile.display_name,
          bio: profile.bio,
          phone: profile.phone,
          email: profile.email,
          gender: profile.gender,
          cities: profile.cities,
          service_location_type: profile.service_location_type,
          studio_address: profile.studio_address,
          services: profile.services,
          styles: profile.styles,
          min_price: profile.min_price,
          max_price: profile.max_price,
          instagram_handle: profile.instagram_handle,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setMessage({ type: "success", text: "個人檔案已更新" });
      } else {
        setMessage({ type: "error", text: "更新失敗，請稍後再試" });
      }
    } catch {
      setMessage({ type: "error", text: "網路錯誤，請稍後再試" });
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (field: "cities" | "services" | "styles", value: string) => {
    if (!profile) return;
    const arr = profile[field];
    setProfile({
      ...profile,
      [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">找不到美甲師資料</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500">
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回
          </button>
          <h1 className="text-lg font-semibold text-pink-500">編輯個人檔案</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Basic Info */}
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">基本資料</h2>

            <div>
              <Label>名稱 *</Label>
              <Input
                value={profile.display_name}
                onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
              />
            </div>

            <div>
              <Label>性別</Label>
              <div className="mt-1 flex gap-2">
                {["female", "male", "other"].map((g) => (
                  <Badge
                    key={g}
                    variant={profile.gender === g ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setProfile({ ...profile, gender: g })}
                  >
                    {g === "female" ? "女" : g === "male" ? "男" : "其他"}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>電話</Label>
              <Input
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              />
            </div>

            <div>
              <Label>Instagram</Label>
              <Input
                placeholder="@your_handle"
                value={profile.instagram_handle || ""}
                onChange={(e) => setProfile({ ...profile, instagram_handle: e.target.value })}
              />
            </div>

            <div>
              <Label>自我介紹</Label>
              <Textarea
                value={profile.bio || ""}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                placeholder="介紹你的專長和風格..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Service Location */}
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">服務地區</h2>

            <div className="flex flex-wrap gap-2">
              {LOCATIONS.map((loc) => (
                <Badge
                  key={loc}
                  variant={profile.cities.includes(loc) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("cities", loc)}
                >
                  {loc}
                </Badge>
              ))}
            </div>

            <div>
              <Label>服務地點類型</Label>
              <div className="mt-1 flex gap-2">
                {["store", "home_visit", "both"].map((t) => (
                  <Badge
                    key={t}
                    variant={profile.service_location_type === t ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setProfile({ ...profile, service_location_type: t })}
                  >
                    {t === "store" ? "工作室" : t === "home_visit" ? "到府服務" : "皆可"}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <Label>工作室地址</Label>
              <Input
                value={profile.studio_address || ""}
                onChange={(e) => setProfile({ ...profile, studio_address: e.target.value })}
                placeholder="選填，如有固定工作室"
              />
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">服務項目</h2>
            <div className="flex flex-wrap gap-2">
              {NAIL_SERVICES.map((s) => (
                <Badge
                  key={s.value}
                  variant={profile.services.includes(s.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("services", s.value)}
                >
                  {s.label}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Styles */}
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">擅長風格</h2>
            <div className="flex flex-wrap gap-2">
              {STYLES.map((style) => (
                <Badge
                  key={style}
                  variant={profile.styles.includes(style) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleArrayItem("styles", style)}
                >
                  {style}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="space-y-4 p-4">
            <h2 className="font-semibold">價格範圍</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>最低價 (NT$)</Label>
                <Input
                  type="number"
                  value={profile.min_price || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, min_price: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
              <div>
                <Label>最高價 (NT$)</Label>
                <Input
                  type="number"
                  value={profile.max_price || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, max_price: e.target.value ? Number(e.target.value) : null })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          className="w-full bg-pink-500 hover:bg-pink-600"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 儲存中...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> 儲存變更
            </>
          )}
        </Button>
      </main>
    </div>
  );
}
