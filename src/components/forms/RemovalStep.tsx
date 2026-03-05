"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { REMOVAL_OPTIONS } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function RemovalStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<ServiceRequestFormData>();
  const selected = watch("needsRemoval");

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">是否需要卸甲</h2>
      <p className="mb-6 text-gray-500">讓美甲師更準確估算時間與費用</p>

      <div className="space-y-3">
        {REMOVAL_OPTIONS.map((option) => (
          <Label
            key={option}
            className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${
              selected === option
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setValue("needsRemoval", option, { shouldValidate: true })}
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

      {errors.needsRemoval && (
        <p className="mt-2 text-sm text-red-500">{errors.needsRemoval.message}</p>
      )}
    </div>
  );
}
