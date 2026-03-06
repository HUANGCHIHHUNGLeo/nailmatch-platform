"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { PAYMENT_METHODS } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function PaymentStep() {
  const { watch, setValue } = useFormContext<ServiceRequestFormData>();
  const selected = watch("paymentPreference") || [];

  const togglePayment = (method: string) => {
    if (selected.includes(method)) {
      setValue("paymentPreference", selected.filter((m) => m !== method), { shouldValidate: true });
    } else {
      setValue("paymentPreference", [...selected, method], { shouldValidate: true });
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">付款方式</h2>
      <p className="mb-6 text-gray-500">選擇您習慣的付款方式（可複選，可跳過）</p>

      <div className="space-y-3">
        {PAYMENT_METHODS.map((method) => (
          <Label
            key={method}
            className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${
              selected.includes(method)
                ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selected.includes(method)}
                onCheckedChange={() => togglePayment(method)}
              />
              <span className="font-medium">{method}</span>
            </div>
          </Label>
        ))}
      </div>
    </div>
  );
}
