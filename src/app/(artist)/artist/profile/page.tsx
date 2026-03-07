"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, Loader2, Camera, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { LOCATIONS, NAIL_SERVICES, STYLES } from "@/lib/utils/constants";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";
import { useLiff } from "@/lib/line/liff";

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
  const { isReady, isLoggedIn } = useLiff();
  const { authFetch } = useAuthFetch();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Collapsible section states (default: collapsed)
  const [locationOpen, setLocationOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [stylesOpen, setStylesOpen] = useState(false);
  const [pricingOpen, setPricingOpen] = useState(false);

  useEffect(() => {
    if (!isReady || !isLoggedIn) return;
    authFetch("/api/artists/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setProfile(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady, isLoggedIn, authFetch]);

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
          avatar_url: profile.avatar_url,
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
      } else if (res.status === 404 || res.status === 401) {
        setMessage({ type: "error", text: "登入已過期，請重新開啟頁面" });
      } else {
        const err = await res.json().catch(() => null);
        setMessage({ type: "error", text: err?.error || "更新失敗，請稍後再試" });
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
        <Loader2 className="h-8 w-8 animate-spin text-[var(--brand)]" />
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
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500">
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回
          </button>
          <h1 className="text-lg font-semibold text-[var(--brand)]">編輯個人檔案</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {message && (
          <div
            className={`rounded-lg p-3 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}
          >
            {message.text}
          </div>
        )}

        {/* Avatar */}
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-6">
            <div className="relative">
              <div
                className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-4 border-[var(--brand-light)] shadow-md transition-shadow hover:shadow-lg"
                onClick={() => avatarInputRef.current?.click()}
              >
                {profile.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[var(--brand-light)] text-3xl font-bold text-[var(--brand)]">
                    {profile.display_name.charAt(0)}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
              {avatarUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/70">
                  <Loader2 className="h-6 w-6 animate-spin text-[var(--brand)]" />
                </div>
              )}
            </div>
            <button
              type="button"
              className="text-sm font-medium text-[var(--brand)] hover:underline"
              onClick={() => avatarInputRef.current?.click()}
            >
              更換大頭貼
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setAvatarUploading(true);
                try {
                  const fd = new FormData();
                  fd.append("file", file);
                  fd.append("bucket", "portfolio-images");
                  const uploadRes = await authFetch("/api/upload", { method: "POST", body: fd });
                  if (!uploadRes.ok) { alert("圖片上傳失敗"); return; }
                  const { url } = await uploadRes.json();
                  // Update avatar_url in profile state and save immediately
                  const saveRes = await authFetch("/api/artists/me", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ avatar_url: url }),
                  });
                  if (saveRes.ok) {
                    const updated = await saveRes.json();
                    setProfile(updated);
                    setMessage({ type: "success", text: "大頭貼已更新" });
                  }
                } catch {
                  alert("上傳發生錯誤");
                } finally {
                  setAvatarUploading(false);
                  e.target.value = "";
                }
              }}
            />
          </CardContent>
        </Card>

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
          <CardContent className="p-4">
            <button
              type="button"
              className="flex w-full items-center justify-between"
              onClick={() => setLocationOpen(!locationOpen)}
            >
              <h2 className="font-semibold">
                服務地區
                {!locationOpen && profile.cities.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    已選 {profile.cities.length} 個城市
                  </span>
                )}
              </h2>
              {locationOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: locationOpen ? "500px" : "0px", opacity: locationOpen ? 1 : 0 }}
            >
              <div className="space-y-4 pt-4">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardContent className="p-4">
            <button
              type="button"
              className="flex w-full items-center justify-between"
              onClick={() => setServicesOpen(!servicesOpen)}
            >
              <h2 className="font-semibold">
                服務項目
                {!servicesOpen && profile.services.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    已選 {profile.services.length} 項
                  </span>
                )}
              </h2>
              {servicesOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: servicesOpen ? "500px" : "0px", opacity: servicesOpen ? 1 : 0 }}
            >
              <div className="flex flex-wrap gap-2 pt-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Styles */}
        <Card>
          <CardContent className="p-4">
            <button
              type="button"
              className="flex w-full items-center justify-between"
              onClick={() => setStylesOpen(!stylesOpen)}
            >
              <h2 className="font-semibold">
                擅長風格
                {!stylesOpen && profile.styles.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    已選 {profile.styles.length} 種
                  </span>
                )}
              </h2>
              {stylesOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: stylesOpen ? "500px" : "0px", opacity: stylesOpen ? 1 : 0 }}
            >
              <div className="flex flex-wrap gap-2 pt-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card>
          <CardContent className="p-4">
            <button
              type="button"
              className="flex w-full items-center justify-between"
              onClick={() => setPricingOpen(!pricingOpen)}
            >
              <h2 className="font-semibold">
                價格範圍
                {!pricingOpen && (profile.min_price || profile.max_price) && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    {profile.min_price ? `NT$${profile.min_price.toLocaleString()}` : ""}
                    {profile.min_price && profile.max_price ? " ~ " : ""}
                    {profile.max_price ? `NT$${profile.max_price.toLocaleString()}` : ""}
                  </span>
                )}
              </h2>
              {pricingOpen ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{ maxHeight: pricingOpen ? "500px" : "0px", opacity: pricingOpen ? 1 : 0 }}
            >
              <div className="grid grid-cols-2 gap-4 pt-4">
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
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button
          className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
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
