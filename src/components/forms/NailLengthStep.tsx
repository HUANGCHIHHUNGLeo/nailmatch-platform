"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { NAIL_LENGTHS } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function NailLengthStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<ServiceRequestFormData>();
  const selected = watch("nailLength");

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">指甲長度</h2>
      <p className="mb-6 text-gray-500">選擇您目前的指甲長度</p>

      <div className="space-y-3">
        {NAIL_LENGTHS.map((option) => (
          <Label
            key={option}
            className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${
              selected === option
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setValue("nailLength", option, { shouldValidate: true })}
          >
            <div className={`mr-3 h-5 w-5 rounded-full border-2 ${
              selected === option ? "border-pink-500 bg-pink-500" : "border-gray-300"
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

      {errors.nailLength && (
        <p className="mt-2 text-sm text-red-500">{errors.nailLength.message}</p>
      )}
    </div>
  );
}
