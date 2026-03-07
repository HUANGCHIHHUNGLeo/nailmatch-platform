"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { NAIL_SERVICES, LASH_SERVICES } from "@/lib/utils/constants";
import type { ServiceRequestFormData } from "@/lib/utils/form-schema";

interface PriceHint {
  service: string;
  min: number;
  max: number;
  avg: number;
  count: number;
}

export function ServiceStep() {
  const { watch, setValue, formState: { errors } } = useFormContext<ServiceRequestFormData>();
  const selected = watch("services") || [];
  const [priceHints, setPriceHints] = useState<Record<string, PriceHint>>({});

  // 載入歷史成交價
  useEffect(() => {
    fetch("/api/price-hints")
      .then((r) => (r.ok ? r.json() : { data: [] }))
      .then(({ data }) => {
        const map: Record<string, PriceHint> = {};
        for (const h of data || []) map[h.service] = h;
        setPriceHints(map);
      })
      .catch(() => {});
  }, []);

  const toggleService = (service: string) => {
    if (selected.includes(service)) {
      setValue("services", selected.filter((s) => s !== service), { shouldValidate: true });
    } else {
      setValue("services", [...selected, service], { shouldValidate: true });
    }
  };

  /** 顯示價格提示：優先用歷史成交價，fallback 到靜態 priceHint */
  const renderPriceBadge = (label: string, staticHint: string, isLash?: boolean) => {
    const hint = priceHints[label];
    if (hint && hint.count >= 2) {
      return (
        <Badge
          variant="secondary"
          className={`text-xs ${isLash ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-700"}`}
        >
          近期成交 NT${hint.min.toLocaleString()}~{hint.max.toLocaleString()}
          <span className="ml-1 text-[10px] opacity-60">({hint.count}筆)</span>
        </Badge>
      );
    }
    if (hint && hint.count === 1) {
      return (
        <Badge
          variant="secondary"
          className={`text-xs ${isLash ? "bg-purple-50 text-purple-600" : "bg-amber-50 text-amber-700"}`}
        >
          近期成交 NT${hint.avg.toLocaleString()}
        </Badge>
      );
    }
    if (staticHint) {
      return (
        <Badge variant="secondary" className="text-xs">
          {staticHint}
        </Badge>
      );
    }
    return null;
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
            {renderPriceBadge(service.label, service.priceHint)}
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
            {renderPriceBadge(service.label, service.priceHint, true)}
          </Label>
        ))}
      </div>

      {/* 已選服務的成交價摘要 */}
      {selected.length > 0 && Object.keys(priceHints).length > 0 && (() => {
        const matched = selected.filter((s) => priceHints[s]);
        if (matched.length === 0) return null;
        const totalMin = matched.reduce((sum, s) => sum + (priceHints[s]?.min || 0), 0);
        const totalMax = matched.reduce((sum, s) => sum + (priceHints[s]?.max || 0), 0);
        return (
          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">已選服務近期成交價：</span>
              NT${totalMin.toLocaleString()} ~ NT${totalMax.toLocaleString()}
            </p>
            <p className="mt-0.5 text-xs text-amber-600">
              依據平台歷史成交數據，實際價格由設計師報價為準
            </p>
          </div>
        );
      })()}

      {errors.services && (
        <p className="mt-2 text-sm text-red-500">{errors.services.message}</p>
      )}
    </div>
  );
}
