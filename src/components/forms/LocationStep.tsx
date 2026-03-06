"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LOCATION_GROUPS } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function LocationStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<ServiceRequestFormData>();
  const selected = watch("locations");

  const toggleLocation = (location: string) => {
    const current = selected || [];
    if (current.includes(location)) {
      setValue("locations", current.filter((l) => l !== location), { shouldValidate: true });
    } else {
      setValue("locations", [...current, location], { shouldValidate: true });
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">服務地點</h2>
      <p className="mb-6 text-gray-500">選擇您方便的地區（可多選）</p>

      <div className="space-y-6">
        {LOCATION_GROUPS.map((group) => {
          const disabled = group.enabled === false;
          return (
            <div key={group.city}>
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                {group.city}
                {disabled && (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-normal text-gray-400">
                    尚未開放
                  </span>
                )}
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {group.districts.map((district) => {
                  const locationValue = group.city === "其他" ? district : `${group.city} ${district}`;
                  if (disabled) {
                    return (
                      <div
                        key={locationValue}
                        className="flex cursor-not-allowed items-center gap-3 rounded-xl border-2 border-gray-100 bg-gray-50 p-3 opacity-50"
                      >
                        <Checkbox checked={false} disabled />
                        <span className="text-sm font-medium text-gray-400">{district}</span>
                      </div>
                    );
                  }
                  return (
                    <Label
                      key={locationValue}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-all ${selected?.includes(locationValue)
                          ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <Checkbox
                        checked={selected?.includes(locationValue)}
                        onCheckedChange={() => toggleLocation(locationValue)}
                      />
                      <span className="text-sm font-medium">{district}</span>
                    </Label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {errors.locations && (
        <p className="mt-2 text-sm text-red-500">{errors.locations.message}</p>
      )}
    </div>
  );
}
