"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { STYLES } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function StyleStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<ServiceRequestFormData>();
  const selected = watch("preferredStyles");

  const toggleStyle = (style: string) => {
    const current = selected || [];
    if (current.includes(style)) {
      setValue("preferredStyles", current.filter((s) => s !== style), { shouldValidate: true });
    } else {
      setValue("preferredStyles", [...current, style], { shouldValidate: true });
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">偏好風格</h2>
      <p className="mb-6 text-gray-500">選擇您喜歡的風格（可多選）</p>

      <div className="grid grid-cols-2 gap-3">
        {STYLES.map((style) => (
          <Label
            key={style}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all ${
              selected?.includes(style)
                ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <Checkbox
              checked={selected?.includes(style)}
              onCheckedChange={() => toggleStyle(style)}
            />
            <span className="text-sm font-medium">{style}</span>
          </Label>
        ))}
      </div>

      {errors.preferredStyles && (
        <p className="mt-2 text-sm text-red-500">{errors.preferredStyles.message}</p>
      )}
    </div>
  );
}
