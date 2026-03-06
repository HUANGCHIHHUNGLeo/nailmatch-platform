"use client";

import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function ContactStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ServiceRequestFormData>();

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">聯絡資訊</h2>
      <p className="mb-6 text-gray-500">
        方便設計師與您確認預約細節
      </p>

      <div className="space-y-4">
        <div>
          <Label htmlFor="customerName" className="mb-1 block text-sm font-medium">
            姓名 *
          </Label>
          <Input
            id="customerName"
            placeholder="您的姓名或暱稱"
            {...register("customerName")}
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-500">
              {errors.customerName.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="customerPhone" className="mb-1 block text-sm font-medium">
            電話（選填）
          </Label>
          <Input
            id="customerPhone"
            type="tel"
            placeholder="09xx-xxx-xxx"
            {...register("customerPhone")}
          />
          <p className="mt-1 text-xs text-gray-400">
            僅用於預約確認，不會公開顯示
          </p>
        </div>
      </div>
    </div>
  );
}
