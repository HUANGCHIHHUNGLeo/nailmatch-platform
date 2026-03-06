"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SCHEDULE_OPTIONS } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

// Simplified schema for direct booking
const directBookingSchema = z.object({
  preferredDate: z.string().min(1, "請選擇預約日期"),
  preferredTime: z.string().min(1, "請選擇預約時段"),
  preferredDateCustom: z.string().optional(),
  referenceImages: z.array(z.string()).optional().default([]),
  additionalNotes: z.string().optional().default(""),
  customerName: z.string().min(1, "請輸入姓名"),
  customerPhone: z.string().optional().default(""),
  consentAccepted: z.boolean().refine((v) => v, "請同意服務條款"),
});

type DirectBookingData = z.infer<typeof directBookingSchema>;

interface ArtistInfo {
  id: string;
  display_name: string;
  avatar_url: string | null;
  cities: string[];
  services: string[];
  styles: string[];
  min_price: number | null;
  max_price: number | null;
}

interface DirectBookingFormProps {
  artist: ArtistInfo;
  onSubmit: (data: ServiceRequestFormData) => Promise<void>;
}

const TIME_OPTIONS = [
  "早上 (09:00 - 12:00)",
  "下午 (12:00 - 18:00)",
  "晚上 (18:00 - 22:00)",
  "時間皆可配合",
];

export function DirectBookingForm({ artist, onSubmit }: DirectBookingFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<DirectBookingData>({
    resolver: zodResolver(directBookingSchema),
    defaultValues: {
      preferredDate: "",
      preferredTime: "",
      preferredDateCustom: "",
      referenceImages: [],
      additionalNotes: "",
      customerName: "",
      customerPhone: "",
      consentAccepted: false,
    },
  });

  const selectedDate = watch("preferredDate");
  const selectedTime = watch("preferredTime");
  const images = watch("referenceImages") || [];
  const accepted = watch("consentAccepted");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    const uploadedUrls: string[] = [];
    for (const file of Array.from(files)) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "reference-images");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const { url } = await res.json();
          uploadedUrls.push(url);
        }
      } catch (err) {
        console.error("Upload failed:", err);
      }
    }
    if (uploadedUrls.length > 0) {
      setValue("referenceImages", [...images, ...uploadedUrls]);
    }
    setUploading(false);
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setValue("referenceImages", images.filter((_, i) => i !== index));
  };

  const doSubmit = async (data: DirectBookingData) => {
    setIsSubmitting(true);
    try {
      // Map to full ServiceRequestFormData with artist defaults
      const fullData: ServiceRequestFormData = {
        locations: artist.cities || [],
        services: artist.services || [],
        customerGender: "不限",
        nailLength: "",
        preferredStyles: artist.styles || [],
        preferredDate: data.preferredDate,
        preferredDateCustom: data.preferredDateCustom || "",
        preferredTime: data.preferredTime,
        artistGenderPref: "不限",
        budgetRange: "依設計師報價",
        needsRemoval: "不需要",
        paymentPreference: [],
        referenceImages: data.referenceImages || [],
        additionalNotes: data.additionalNotes || "",
        customerName: data.customerName,
        customerPhone: data.customerPhone || "",
        consentAccepted: true,
      };
      await onSubmit(fullData);
    } catch (err) {
      console.error("Submit error:", err);
      alert("送出失敗，請重試");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      {/* Artist Card */}
      <Card className="border-[var(--brand-light)] bg-white">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-14 w-14">
              <AvatarImage src={artist.avatar_url || undefined} />
              <AvatarFallback className="bg-[var(--brand-light)] text-lg text-[var(--brand-dark)]">
                {artist.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="text-base font-bold text-gray-900">
                {artist.display_name}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {(artist.services || []).slice(0, 4).map((s) => (
                  <Badge key={s} variant="secondary" className="text-[10px]">
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-400">
                {(artist.cities || []).slice(0, 2).join("、")}
                {artist.min_price != null && ` · NT$${artist.min_price.toLocaleString()} 起`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(doSubmit)} className="space-y-5">
        {/* Schedule */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 text-lg font-bold text-gray-900">想什麼時候做？</h2>

            <div className="grid grid-cols-2 gap-2">
              {SCHEDULE_OPTIONS.map((option) => (
                <Label
                  key={option}
                  className={`flex cursor-pointer items-center justify-center rounded-xl border-2 p-3 text-center text-sm transition-all ${
                    selectedDate === option
                      ? "border-[var(--brand)] bg-[var(--brand-light)]/50 font-semibold"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setValue("preferredDate", option, { shouldValidate: true })}
                >
                  {option}
                </Label>
              ))}
            </div>

            {selectedDate === "其他日期" && (
              <Input
                type="date"
                {...register("preferredDateCustom")}
                className="mt-3"
              />
            )}
            {errors.preferredDate && (
              <p className="mt-1 text-xs text-red-500">{errors.preferredDate.message}</p>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2">
              {TIME_OPTIONS.map((time) => (
                <Label
                  key={time}
                  className={`flex cursor-pointer items-center justify-center rounded-xl border-2 p-3 text-center text-sm transition-all ${
                    selectedTime === time
                      ? "border-[var(--brand)] bg-[var(--brand-light)]/50 font-semibold"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setValue("preferredTime", time, { shouldValidate: true })}
                >
                  {time}
                </Label>
              ))}
            </div>
            {errors.preferredTime && (
              <p className="mt-1 text-xs text-red-500">{errors.preferredTime.message}</p>
            )}
          </CardContent>
        </Card>

        {/* Notes + Reference */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 text-lg font-bold text-gray-900">想做什麼款式？</h2>
            <p className="mb-3 text-sm text-gray-500">
              描述您想要的款式，或上傳參考圖片（選填）
            </p>

            <Textarea
              {...register("additionalNotes")}
              placeholder="例如：想做韓系簡約風、法式白色凝膠、需要卸甲..."
              rows={3}
              className="resize-none"
            />

            {/* Image upload */}
            <div className="mt-3">
              <Label
                htmlFor="direct-image-upload"
                className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 transition-all ${
                  uploading
                    ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                    : "border-gray-300 hover:border-[var(--brand)]"
                }`}
              >
                {uploading ? (
                  <span className="text-sm text-[var(--brand)]">上傳中...</span>
                ) : (
                  <>
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16v-8m-3 3l3-3 3 3M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                    </svg>
                    <span className="text-sm text-gray-500">上傳參考圖片</span>
                  </>
                )}
                <input
                  id="direct-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </Label>
            </div>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {images.map((url, index) => (
                  <div key={index} className="group relative aspect-square">
                    <img src={url} alt="" className="h-full w-full rounded-lg object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 text-lg font-bold text-gray-900">您的聯絡資訊</h2>
            <div className="space-y-3">
              <div>
                <Label className="mb-1 block text-sm font-medium">姓名 *</Label>
                <Input placeholder="您的姓名或暱稱" {...register("customerName")} />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>
                )}
              </div>
              <div>
                <Label className="mb-1 block text-sm font-medium">電話（選填）</Label>
                <Input type="tel" placeholder="09xx-xxx-xxx" {...register("customerPhone")} />
                <p className="mt-1 text-xs text-gray-400">僅用於預約確認，不會公開</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Consent + Submit */}
        <Card>
          <CardContent className="p-4">
            <Label
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all ${
                accepted
                  ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                  : "border-gray-200"
              }`}
              onClick={() => setValue("consentAccepted", !accepted, { shouldValidate: true })}
            >
              <Checkbox
                checked={!!accepted}
                onCheckedChange={(checked) => setValue("consentAccepted", !!checked, { shouldValidate: true })}
                className="mt-0.5"
              />
              <span className="text-xs leading-relaxed text-gray-600">
                我已閱讀並同意{" "}
                <Link href="/terms" target="_blank" className="text-[var(--brand)] underline" onClick={(e) => e.stopPropagation()}>服務條款</Link>
                {" "}與{" "}
                <Link href="/privacy" target="_blank" className="text-[var(--brand)] underline" onClick={(e) => e.stopPropagation()}>隱私權政策</Link>
              </span>
            </Label>
            {errors.consentAccepted && (
              <p className="mt-1 text-xs text-red-500">{errors.consentAccepted.message}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !accepted}
              className="mt-4 w-full bg-[var(--brand)] py-5 text-base font-semibold hover:bg-[var(--brand-dark)]"
            >
              {isSubmitting ? "送出中..." : `向 ${artist.display_name} 預約`}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
