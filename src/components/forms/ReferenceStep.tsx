"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function ReferenceStep() {
  const { watch, setValue } = useFormContext<ServiceRequestFormData>();
  const images = watch("referenceImages") || [];
  const [uploading, setUploading] = useState(false);

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

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">參考款式</h2>
      <p className="mb-6 text-gray-500">
        上傳喜歡的美甲圖片，讓美甲師更準確報價（選填）
      </p>

      {/* Upload area */}
      <Label
        htmlFor="image-upload"
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all ${uploading ? "border-[var(--brand)] bg-[var(--brand-light)]/50" : "border-gray-300 hover:border-[var(--brand)] hover:bg-[var(--brand-light)]/50"}`}
      >
        {uploading ? (
          <>
            <div className="mb-2 h-10 w-10 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
            <span className="text-sm text-[var(--brand)]">上傳中...</span>
          </>
        ) : (
          <>
            <svg
              className="mb-2 h-10 w-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 16v-8m0 0l-3 3m3-3l3 3M3 16.5V18a2.5 2.5 0 002.5 2.5h13A2.5 2.5 0 0021 18v-1.5M16.5 12L12 16.5 7.5 12"
              />
            </svg>
            <span className="text-sm text-gray-500">點擊上傳圖片</span>
            <span className="mt-1 text-xs text-gray-400">支援 JPG, PNG, WEBP</span>
          </>
        )}
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </Label>

      {/* Preview */}
      {images.length > 0 && (
        <div className="mt-4 grid grid-cols-3 gap-3">
          {images.map((url, index) => (
            <div key={index} className="group relative aspect-square">
              <img
                src={url}
                alt={`Reference ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
