"use client";

import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SCHEDULE_OPTIONS } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function ScheduleStep() {
  const { watch, setValue, register, formState: { errors } } = useFormContext<ServiceRequestFormData>();
  const selectedDate = watch("preferredDate");
  const selectedTime = watch("preferredTime");

  const TIME_OPTIONS = [
    "早上 (09:00 - 12:00)",
    "下午 (12:00 - 18:00)",
    "晚上 (18:00 - 22:00)",
    "時間皆可配合",
  ];

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">預約時間</h2>
      <p className="mb-6 text-gray-500">選擇您希望的服務時間</p>

      <div className="space-y-3">
        {SCHEDULE_OPTIONS.map((option) => (
          <Label
            key={option}
            className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${selectedDate === option
              ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
              : "border-gray-200 hover:border-gray-300"
              }`}
            onClick={() => setValue("preferredDate", option, { shouldValidate: true })}
          >
            <div className={`mr-3 h-5 w-5 rounded-full border-2 ${selectedDate === option ? "border-[var(--brand)] bg-[var(--brand)]" : "border-gray-300"
              }`}>
              {selectedDate === option && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>
            <span className="font-medium">{option}</span>
          </Label>
        ))}
      </div>

      {selectedDate === "其他日期" && (
        <div className="mt-4">
          <Label className="mb-2 text-sm text-gray-600">請選擇日期</Label>
          <Input
            type="date"
            {...register("preferredDateCustom")}
            className="mt-1"
          />
        </div>
      )}

      {errors.preferredDate && (
        <p className="mt-2 text-sm text-red-500">{errors.preferredDate.message}</p>
      )}

      <div className="mt-8">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">預約時段</h3>
        <div className="space-y-3">
          {TIME_OPTIONS.map((time) => (
            <Label
              key={time}
              className={`flex cursor-pointer items-center rounded-xl border-2 p-4 transition-all ${selectedTime === time
                ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
                : "border-gray-200 hover:border-gray-300"
                }`}
              onClick={() => setValue("preferredTime", time, { shouldValidate: true })}
            >
              <div className={`mr-3 h-5 w-5 rounded-full border-2 ${selectedTime === time ? "border-[var(--brand)] bg-[var(--brand)]" : "border-gray-300"
                }`}>
                {selectedTime === time && (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white" />
                  </div>
                )}
              </div>
              <span className="font-medium">{time}</span>
            </Label>
          ))}
        </div>

        {errors.preferredTime && (
          <p className="mt-2 text-sm text-red-500">{errors.preferredTime.message}</p>
        )}
      </div>
    </div>
  );
}
