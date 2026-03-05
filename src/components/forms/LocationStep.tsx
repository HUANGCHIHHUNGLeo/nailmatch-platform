"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { LOCATIONS } from "@/lib/utils/constants";
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

      <div className="grid grid-cols-2 gap-3">
        {LOCATIONS.map((location) => (
          <Label
            key={location}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
              selected?.includes(location)
                ? "border-pink-500 bg-pink-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Checkbox
              checked={selected?.includes(location)}
              onCheckedChange={() => toggleLocation(location)}
            />
            <span className="text-sm font-medium">{location}</span>
          </Label>
        ))}
      </div>

      {errors.locations && (
        <p className="mt-2 text-sm text-red-500">{errors.locations.message}</p>
      )}
    </div>
  );
}
