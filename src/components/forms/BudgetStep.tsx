"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { BUDGET_RANGES } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function BudgetStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<ServiceRequestFormData>();
  const selected = watch("budgetRange");

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">預算範圍</h2>
      <p className="mb-6 text-gray-500">選擇您的預算區間</p>

      <div className="space-y-3">
        {BUDGET_RANGES.map((budget) => (
          <Label
            key={budget.value}
            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
              selected === budget.value
                ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setValue("budgetRange", budget.value, { shouldValidate: true })}
          >
            <div className="flex items-center">
              <div className={`mr-3 h-5 w-5 rounded-full border-2 ${
                selected === budget.value ? "border-[var(--brand)] bg-[var(--brand)]" : "border-gray-300"
              }`}>
                {selected === budget.value && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <span className="font-medium">{budget.label}</span>
            </div>
            <span className="text-sm text-gray-400">{budget.description}</span>
          </Label>
        ))}
      </div>

      {errors.budgetRange && (
        <p className="mt-2 text-sm text-red-500">{errors.budgetRange.message}</p>
      )}
    </div>
  );
}
