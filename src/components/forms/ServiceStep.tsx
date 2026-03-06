"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NAIL_SERVICES, LASH_SERVICES } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function ServiceStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<ServiceRequestFormData>();
  const selected = watch("services") || [];

  const toggleService = (service: string) => {
    if (selected.includes(service)) {
      setValue("services", selected.filter((s) => s !== service), { shouldValidate: true });
    } else {
      setValue("services", [...selected, service], { shouldValidate: true });
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">服務項目</h2>
      <p className="mb-6 text-gray-500">選擇您想要的服務（可複選，美甲美睫皆可）</p>

      {/* Nail Services */}
      <h3 className="mb-3 text-sm font-semibold text-[var(--brand-dark)] uppercase tracking-wide">美甲服務</h3>
      <div className="space-y-3">
        {NAIL_SERVICES.map((service) => (
          <Label
            key={service.value}
            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
              selected.includes(service.label)
                ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selected.includes(service.label)}
                onCheckedChange={() => toggleService(service.label)}
              />
              <span className="font-medium">{service.label}</span>
            </div>
            {service.priceHint && (
              <Badge variant="secondary" className="text-xs">
                {service.priceHint}
              </Badge>
            )}
          </Label>
        ))}
      </div>

      {/* Lash Services */}
      <h3 className="mb-3 mt-8 text-sm font-semibold text-purple-700 uppercase tracking-wide">美睫服務</h3>
      <div className="space-y-3">
        {LASH_SERVICES.map((service) => (
          <Label
            key={service.value}
            className={`flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all ${
              selected.includes(service.label)
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selected.includes(service.label)}
                onCheckedChange={() => toggleService(service.label)}
              />
              <span className="font-medium">{service.label}</span>
            </div>
            {service.priceHint && (
              <Badge variant="secondary" className="text-xs">
                {service.priceHint}
              </Badge>
            )}
          </Label>
        ))}
      </div>

      {errors.services && (
        <p className="mt-2 text-sm text-red-500">{errors.services.message}</p>
      )}
    </div>
  );
}
