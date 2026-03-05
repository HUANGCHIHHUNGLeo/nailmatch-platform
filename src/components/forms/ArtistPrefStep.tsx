"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

const OPTIONS = ["不限", "女性", "男性"];

export function ArtistPrefStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<ServiceRequestFormData>();
  const selected = watch("artistGenderPref");

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">偏好美甲師</h2>
      <p className="mb-6 text-gray-500">選擇您偏好的美甲師性別</p>

      <div className="space-y-3">
        {OPTIONS.map((option) => (
          <Label
            key={option}
            className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${
              selected === option
                ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setValue("artistGenderPref", option, { shouldValidate: true })}
          >
            <div className={`mr-3 h-5 w-5 rounded-full border-2 ${
              selected === option ? "border-[var(--brand)] bg-[var(--brand)]" : "border-gray-300"
            }`}>
              {selected === option && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>
            <span className="font-medium">{option}</span>
          </Label>
        ))}
      </div>

      {errors.artistGenderPref && (
        <p className="mt-2 text-sm text-red-500">{errors.artistGenderPref.message}</p>
      )}
    </div>
  );
}
