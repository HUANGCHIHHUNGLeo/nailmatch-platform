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
import Link from "next/link";
import {
  artistRegistrationSchema,
  type ArtistRegistrationFormData,
} from "@/lib/utils/form-schema";
import { LOCATION_GROUPS, NAIL_SERVICES, LASH_SERVICES, STYLES, PAYMENT_METHODS } from "@/lib/utils/constants";

function ArtistFormContent() {
  const { liff, isReady, profile } = useLiff();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [role, setRole] = useState<"nail" | "lash" | "">("");
  const [consentAccepted, setConsentAccepted] = useState(false);

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
      paymentMethods: [],
    },
  });

  const cities = watch("cities");
  const services = watch("services");
  const styles = watch("styles");
  const paymentMethods = watch("paymentMethods");

  const toggleArrayField = (
    field: "cities" | "services" | "styles" | "paymentMethods",
    value: string,
    current: string[]
  ) => {
    if (current.includes(value)) {
      setValue(field, current.filter((v) => v !== value), { shouldValidate: true });
    } else {
      setValue(field, [...current, value], { shouldValidate: true });
    }
  };

  const toggleAllDistricts = (group: typeof LOCATION_GROUPS[number]) => {
    const groupLocations = group.city === "其他"
      ? group.districts
      : group.districts.map((d) => `${group.city} ${d}`);
    const allSelected = groupLocations.every((loc) => cities.includes(loc));
    if (allSelected) {
      setValue("cities", cities.filter((c) => !groupLocations.includes(c)), { shouldValidate: true });
    } else {
      const newCities = [...new Set([...cities, ...groupLocations])];
      setValue("cities", newCities, { shouldValidate: true });
    }
  };

  const roleServices = role === "lash" ? LASH_SERVICES : NAIL_SERVICES;

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
          consentAccepted: true,
        }),
      });

      if (!response.ok) throw new Error("Registration failed");

      setIsSuccess(true);

      if (liff?.isInClient()) {
        await liff.sendMessages([
          { type: "text", text: `${role === "lash" ? "美睫師" : "美甲師"}註冊申請已送出！審核通過後會通知您。` },
        ]).catch(() => { });
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
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand-light)] border-t-[var(--brand)]" />
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
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-lg items-center px-4">
          <h1 className="text-lg font-semibold text-[var(--brand)]">
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
                  className="w-full bg-[var(--brand)] py-6 text-lg hover:bg-[var(--brand-dark)]"
                  onClick={() => setRole("nail")}
                >
                  我是美甲師
                </Button>
                <Button
                  className="w-full bg-[var(--brand-dark)] py-6 text-lg hover:bg-[var(--brand-darker)]"
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
                        className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2 ${watch("gender") === g ? "border-[var(--brand)] bg-[var(--brand-light)]/50" : "border-gray-200"
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
                  <Input {...register("studioAddress")} placeholder="如無店名請填「姓名＋個人工作室」" />
                  {errors.studioAddress && (
                    <p className="mt-1 text-xs text-red-500">{errors.studioAddress.message}</p>
                  )}
                </div>

                <div>
                  <Label>自我介紹</Label>
                  <Textarea {...register("bio")} placeholder="介紹一下您的專長和經驗..." rows={3} />
                </div>

                {/* IG & LINE — unified hint */}
                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                  <p className="mb-3 text-xs font-medium text-gray-600">
                    以下 LINE ID 或 Instagram 請至少填寫一項，有助於審核通過
                  </p>
                  <div className="space-y-3">
                    <div>
                      <Label>Instagram</Label>
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">@</span>
                        <Input {...register("instagramHandle")} placeholder="your_handle" />
                      </div>
                    </div>
                    <div>
                      <Label>LINE ID</Label>
                      <Input {...register("lineId")} placeholder="例：@nalimatch" />
                    </div>
                  </div>
                  {errors.lineId && (
                    <p className="mt-2 text-xs text-red-500">{errors.lineId.message}</p>
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
                  const allSelected = selectedCount === groupLocations.length;
                  return (
                    <details key={group.city} className="rounded-lg border">
                      <summary className="flex cursor-pointer items-center justify-between p-3 font-medium">
                        <span>{group.city}</span>
                        {selectedCount > 0 && (
                          <span className="rounded-full bg-[var(--brand-light)] px-2 py-0.5 text-xs text-[var(--brand-dark)]">
                            已選 {selectedCount}
                          </span>
                        )}
                      </summary>
                      <div className="border-t p-3">
                        {group.city !== "其他" && (
                          <button
                            type="button"
                            onClick={() => toggleAllDistricts(group)}
                            className={`mb-2 w-full rounded-lg border-2 border-dashed px-3 py-2 text-sm font-medium transition ${
                              allSelected
                                ? "border-[var(--brand)] bg-[var(--brand-light)]/50 text-[var(--brand-dark)]"
                                : "border-gray-300 text-gray-500 hover:border-gray-400"
                            }`}
                          >
                            {allSelected ? `取消全選 ${group.city}` : `全選 ${group.city}`}
                          </button>
                        )}
                        <div className="grid grid-cols-2 gap-2">
                          {groupLocations.map((loc) => (
                            <Label
                              key={loc}
                              className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-2 text-sm ${cities.includes(loc) ? "border-[var(--brand)] bg-[var(--brand-light)]/50" : "border-gray-200"
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
                      </div>
                    </details>
                  );
                })}
                {errors.cities && (
                  <p className="mt-1 text-xs text-red-500">{errors.cities.message}</p>
                )}

                <div>
                  <Label>服務地點類型 *</Label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {["studio", "home_service", "both"].map((type) => (
                      <Label
                        key={type}
                        className={`cursor-pointer rounded-lg border-2 px-3 py-2 text-sm ${watch("serviceLocationType") === type
                            ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
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
                  {roleServices.map((svc) => (
                    <Label
                      key={svc.value}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 text-sm ${services.includes(svc.label) ? "border-[var(--brand)] bg-[var(--brand-light)]/50" : "border-gray-200"
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
                {errors.services && (
                  <p className="mt-1 text-xs text-red-500">{errors.services.message}</p>
                )}
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
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 text-sm ${styles.includes(style) ? "border-[var(--brand)] bg-[var(--brand-light)]/50" : "border-gray-200"
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
                {errors.styles && (
                  <p className="mt-1 text-xs text-red-500">{errors.styles.message}</p>
                )}
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

            {/* Payment Methods */}
            <Card>
              <CardContent className="space-y-4 p-4">
                <h2 className="font-semibold">接受付款方式 *</h2>
                <p className="text-xs text-gray-500">選擇您接受的付款方式，讓客戶更方便選擇</p>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((method) => (
                    <Label
                      key={method}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 text-sm ${paymentMethods.includes(method) ? "border-[var(--brand)] bg-[var(--brand-light)]/50" : "border-gray-200"
                        }`}
                    >
                      <Checkbox
                        checked={paymentMethods.includes(method)}
                        onCheckedChange={() => toggleArrayField("paymentMethods", method, paymentMethods)}
                      />
                      {method}
                    </Label>
                  ))}
                </div>
                {errors.paymentMethods && (
                  <p className="mt-1 text-xs text-red-500">{errors.paymentMethods.message}</p>
                )}
              </CardContent>
            </Card>

            {/* Consent */}
            <Card>
              <CardContent className="p-4">
                <Label
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
                    consentAccepted
                      ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                      : "border-gray-200"
                  }`}
                  onClick={() => setConsentAccepted(!consentAccepted)}
                >
                  <Checkbox
                    checked={consentAccepted}
                    onCheckedChange={(checked) => setConsentAccepted(!!checked)}
                    className="mt-0.5"
                  />
                  <span className="text-sm leading-relaxed text-gray-700">
                    我已閱讀並同意{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="font-medium text-[var(--brand)] underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      服務條款
                    </Link>{" "}
                    與{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="font-medium text-[var(--brand)] underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      隱私權政策
                    </Link>
                    ，並同意本平台依個人資料保護法蒐集、處理及利用我的個人資料
                  </span>
                </Label>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={isSubmitting || !consentAccepted}
              className="w-full bg-[var(--brand)] py-6 text-lg hover:bg-[var(--brand-dark)]"
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
