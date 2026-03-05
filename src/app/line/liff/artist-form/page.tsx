"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LiffProvider, useLiff } from "@/lib/line/liff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  artistRegistrationSchema,
  type ArtistRegistrationFormData,
} from "@/lib/utils/form-schema";
import { LOCATION_GROUPS, NAIL_SERVICES, STYLES } from "@/lib/utils/constants";

function ArtistFormContent() {
  const { liff, isReady, profile } = useLiff();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [role, setRole] = useState<"nail" | "lash" | "">("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ArtistRegistrationFormData>({
    resolver: zodResolver(artistRegistrationSchema),
    defaultValues: {
      displayName: profile?.displayName || "",
      gender: "",
      phone: "",
      email: "",
      bio: "",
      cities: [],
      serviceLocationType: "",
      studioAddress: "",
      services: [],
      styles: [],
      minPrice: 500,
      maxPrice: 3000,
      instagramHandle: "",
      lineId: "",
    },
  });

  const cities = watch("cities");
  const services = watch("services");
  const styles = watch("styles");

  const toggleArrayField = (
    field: "cities" | "services" | "styles",
    value: string,
    current: string[]
  ) => {
    if (current.includes(value)) {
      setValue(field, current.filter((v) => v !== value), { shouldValidate: true });
    } else {
      setValue(field, [...current, value], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: ArtistRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/artists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(liff ? { Authorization: `Bearer ${liff.getIDToken()}` } : {}),
        },
        body: JSON.stringify({
          ...data,
          role: role || "nail",
          lineProfile: profile,
        }),
      });

      if (!response.ok) throw new Error("Registration failed");

      setIsSuccess(true);

      if (liff?.isInClient()) {
        await liff.sendMessages([
          { type: "text", text: `${role === "lash" ? "美睫師" : "美甲師"}註冊申請已送出！審核通過後會通知您。` },
        ]).catch(() => {});
      }
    } catch (err) {
      console.error("Registration error:", err);
      alert("註冊失敗，請重試");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isSuccess) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (liff?.isInClient()) {
            liff.closeWindow();
          } else {
            window.location.href = "/";
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSuccess, liff]);

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-3xl">
              ✓
            </div>
            <h2 className="mb-2 text-xl font-bold">申請已送出！</h2>
            <p className="text-gray-500">
              我們會盡快審核您的資料，審核通過後會透過 LINE 通知您。
            </p>
            <p className="mt-3 text-sm text-gray-400">{countdown} 秒後自動跳轉...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="text-lg font-semibold text-pink-500">
            NaLi Match {role === "lash" ? "美睫師" : "美甲師"}入駐
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-lg p-4">
        {/* Role Selection */}
        {!role && (
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="mb-4 text-lg font-bold text-gray-900">請選擇您的身份</h2>
              <div className="space-y-3">
                <Button
                  className="w-full bg-pink-500 py-6 text-lg hover:bg-pink-600"
                  onClick={() => setRole("nail")}
                >
                  我是美甲師
                </Button>
                <Button
                  className="w-full bg-purple-500 py-6 text-lg hover:bg-purple-600"
                  onClick={() => setRole("lash")}
                >
                  我是美睫師
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {role && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="font-semibold">基本資料</h2>

              <div>
                <Label>名稱 *</Label>
                <Input {...register("displayName")} placeholder="您的名稱或暱稱" />
                {errors.displayName && (
                  <p className="mt-1 text-xs text-red-500">{errors.displayName.message}</p>
                )}
              </div>

              <div>
                <Label>性別 *</Label>
                <div className="mt-1 flex gap-3">
                  {["female", "male"].map((g) => (
                    <Label
                      key={g}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2 ${
                        watch("gender") === g ? "border-pink-500 bg-pink-50" : "border-gray-200"
                      }`}
                      onClick={() => setValue("gender", g, { shouldValidate: true })}
                    >
                      {g === "female" ? "女" : "男"}
                    </Label>
                  ))}
                </div>
              </div>

              <div>
                <Label>電話 *</Label>
                <Input {...register("phone")} placeholder="0912-345-678" />
                {errors.phone && (
                  <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <Label>Email *</Label>
                <Input {...register("email")} type="email" placeholder="your@email.com" />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label>店名 / 工作室名稱 *</Label>
                <Input {...register("studioAddress")} placeholder="例：Nali Nail Studio" />
                {errors.studioAddress && (
                  <p className="mt-1 text-xs text-red-500">{errors.studioAddress.message}</p>
                )}
              </div>

              <div>
                <Label>自我介紹</Label>
                <Textarea {...register("bio")} placeholder="介紹一下您的專長和經驗..." rows={3} />
              </div>

              <div>
                <Label>Instagram {!watch("lineId") && "*"}</Label>
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">@</span>
                  <Input {...register("instagramHandle")} placeholder="your_handle" />
                </div>
                <p className="mt-1 text-xs text-gray-400">LINE ID 或 Instagram 至少填一項</p>
              </div>

              <div>
                <Label>LINE ID {!watch("instagramHandle") && "*"}</Label>
                <Input {...register("lineId")} placeholder="例：@nalimatch" />
                {errors.lineId && (
                  <p className="mt-1 text-xs text-red-500">{errors.lineId.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Service Area */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="font-semibold">服務地區 *</h2>
              <p className="text-xs text-gray-500">選擇您可以服務的區域（可複選）</p>
              {LOCATION_GROUPS.map((group) => {
                const groupLocations = group.city === "其他"
                  ? group.districts
                  : group.districts.map((d) => `${group.city} ${d}`);
                const selectedCount = groupLocations.filter((loc) => cities.includes(loc)).length;
                return (
                  <details key={group.city} className="rounded-lg border">
                    <summary className="flex cursor-pointer items-center justify-between p-3 font-medium">
                      <span>{group.city}</span>
                      {selectedCount > 0 && (
                        <span className="rounded-full bg-pink-100 px-2 py-0.5 text-xs text-pink-600">
                          已選 {selectedCount}
                        </span>
                      )}
                    </summary>
                    <div className="grid grid-cols-2 gap-2 border-t p-3">
                      {groupLocations.map((loc) => (
                        <Label
                          key={loc}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2 text-sm ${
                            cities.includes(loc) ? "border-pink-500 bg-pink-50" : "border-gray-200"
                          }`}
                        >
                          <Checkbox
                            checked={cities.includes(loc)}
                            onCheckedChange={() => toggleArrayField("cities", loc, cities)}
                          />
                          {group.city === "其他" ? loc : loc.replace(`${group.city} `, "")}
                        </Label>
                      ))}
                    </div>
                  </details>
                );
              })}

              <div>
                <Label>服務地點類型 *</Label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {["studio", "home_service", "both"].map((type) => (
                    <Label
                      key={type}
                      className={`cursor-pointer rounded-lg border-2 px-3 py-2 text-sm ${
                        watch("serviceLocationType") === type
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-200"
                      }`}
                      onClick={() => setValue("serviceLocationType", type, { shouldValidate: true })}
                    >
                      {type === "studio" ? "工作室" : type === "home_service" ? "到府服務" : "都可以"}
                    </Label>
                  ))}
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="font-semibold">服務項目 *</h2>
              <div className="grid grid-cols-2 gap-2">
                {NAIL_SERVICES.map((svc) => (
                  <Label
                    key={svc.value}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 text-sm ${
                      services.includes(svc.label) ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    }`}
                  >
                    <Checkbox
                      checked={services.includes(svc.label)}
                      onCheckedChange={() => toggleArrayField("services", svc.label, services)}
                    />
                    {svc.label}
                  </Label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Styles */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="font-semibold">擅長風格 *</h2>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((style) => (
                  <Label
                    key={style}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 text-sm ${
                      styles.includes(style) ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    }`}
                  >
                    <Checkbox
                      checked={styles.includes(style)}
                      onCheckedChange={() => toggleArrayField("styles", style, styles)}
                    />
                    {style}
                  </Label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Price Range */}
          <Card>
            <CardContent className="space-y-4 p-4">
              <h2 className="font-semibold">價格範圍 *</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>最低價 (NT$)</Label>
                  <Input
                    type="number"
                    {...register("minPrice", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label>最高價 (NT$)</Label>
                  <Input
                    type="number"
                    {...register("maxPrice", { valueAsNumber: true })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-pink-500 py-6 text-lg hover:bg-pink-600"
          >
            {isSubmitting ? "送出中..." : "送出申請"}
          </Button>
        </form>
        )}
      </main>
    </div>
  );
}

export default function LiffArtistForm() {
  return (
    <LiffProvider>
      <ArtistFormContent />
    </LiffProvider>
  );
}
