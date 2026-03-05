"use client";

import { useFormContext } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { CHAT_PREFERENCES } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

export function NotesStep() {
  const { register, watch, setValue } = useFormContext<ServiceRequestFormData>();
  const notes = watch("additionalNotes") || "";

  const toggleChatPref = (pref: string) => {
    const prefix = `【聊天偏好：${pref}】`;
    if (notes.includes(prefix)) {
      setValue("additionalNotes", notes.replace(prefix, "").trim());
    } else {
      // Remove other chat preferences first
      let cleaned = notes;
      CHAT_PREFERENCES.forEach((p) => {
        cleaned = cleaned.replace(`【聊天偏好：${p}】`, "").trim();
      });
      setValue("additionalNotes", `${prefix} ${cleaned}`.trim());
    }
  };

  return (
    <div>
      <h2 className="mb-2 text-2xl font-bold text-gray-900">補充需求</h2>
      <p className="mb-6 text-gray-500">還有什麼想告訴美甲師的？（選填）</p>

      {/* Chat preference */}
      <div className="mb-4">
        <Label className="mb-2 block text-sm font-medium text-gray-700">
          聊天偏好
        </Label>
        <div className="flex gap-4">
          {CHAT_PREFERENCES.map((pref) => (
            <Label
              key={pref}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-4 py-2 transition-all ${
                notes.includes(`【聊天偏好：${pref}】`)
                  ? "border-pink-500 bg-pink-50"
                  : "border-gray-200"
              }`}
            >
              <Checkbox
                checked={notes.includes(`【聊天偏好：${pref}】`)}
                onCheckedChange={() => toggleChatPref(pref)}
              />
              <span className="text-sm">{pref}</span>
            </Label>
          ))}
        </div>
      </div>

      {/* Free text */}
      <Textarea
        {...register("additionalNotes")}
        placeholder="例如：希望做簡約風格、有指甲容易斷裂的問題..."
        rows={4}
        className="resize-none"
      />

      <div className="mt-6 rounded-xl bg-pink-50 p-4">
        <p className="text-sm text-pink-700">
          送出後，系統會自動通知符合條件的美甲師，平均 5 分鐘內就會收到第一個報價！
        </p>
      </div>
    </div>
  );
}
