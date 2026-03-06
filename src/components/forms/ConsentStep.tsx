"use client";

import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function ConsentStep() {
  const {
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ServiceRequestFormData>();

  const accepted = watch("consentAccepted");

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">確認送出</h2>
      <p className="mb-6 text-gray-500">
        請閱讀並同意以下條款後送出需求
      </p>

      {/* Summary hint */}
      <div className="mb-6 rounded-xl bg-[var(--brand-light)]/50 p-4">
        <p className="text-sm text-[var(--brand-darker)]">
          送出後，系統會自動通知符合條件的設計師，平均 5 分鐘內就會收到第一個報價！
        </p>
      </div>

      {/* Consent checkbox */}
      <Label
        className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-all ${
          accepted
            ? "border-[var(--brand)] bg-[var(--brand-light)]/50"
            : "border-gray-200"
        }`}
        onClick={() => setValue("consentAccepted", !accepted, { shouldValidate: true })}
      >
        <Checkbox
          checked={!!accepted}
          onCheckedChange={(checked) =>
            setValue("consentAccepted", !!checked, { shouldValidate: true })
          }
          className="mt-0.5"
        />
        <span className="text-sm leading-relaxed text-gray-700">
          我已閱讀並同意{" "}
          <Link
            href="/terms"
            target="_blank"
            className="font-medium text-[var(--brand)] underline"
            onClick={(e) => e.stopPropagation()}
          >
            服務條款
          </Link>{" "}
          與{" "}
          <Link
            href="/privacy"
            target="_blank"
            className="font-medium text-[var(--brand)] underline"
            onClick={(e) => e.stopPropagation()}
          >
            隱私權政策
          </Link>
        </span>
      </Label>

      {errors.consentAccepted && (
        <p className="mt-2 text-sm text-red-500">
          {errors.consentAccepted.message}
        </p>
      )}
    </div>
  );
}
