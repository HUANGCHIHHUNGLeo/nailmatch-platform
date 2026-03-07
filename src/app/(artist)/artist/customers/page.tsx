"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, Users, MessageSquare, Tag, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

// Fake preview data for behind the overlay
const PREVIEW_CUSTOMERS = [
  {
    id: "1",
    name: "王小美",
    note: "喜歡法式風格，指甲偏薄需注意力道",
    tags: ["VIP", "法式"],
    visits: 8,
    lastVisit: "2025-12-15",
  },
  {
    id: "2",
    name: "林雅婷",
    note: "每次做光療，偏好粉色系",
    tags: ["光療", "粉色系"],
    visits: 5,
    lastVisit: "2025-11-20",
  },
  {
    id: "3",
    name: "張佳琪",
    note: "新客戶，朋友介紹來的",
    tags: ["新客"],
    visits: 1,
    lastVisit: "2025-12-28",
  },
  {
    id: "4",
    name: "陳思穎",
    note: "對凝膠過敏，只能做一般指甲油",
    tags: ["過敏注意", "指甲油"],
    visits: 3,
    lastVisit: "2025-10-05",
  },
  {
    id: "5",
    name: "許雅芳",
    note: "喜歡日系風格，常帶參考圖",
    tags: ["日系", "常客"],
    visits: 12,
    lastVisit: "2026-01-10",
  },
];

export default function ArtistCustomersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center text-sm text-gray-500"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回
          </button>
          <h1 className="text-lg font-semibold text-[var(--brand)]">客戶管理</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="relative mx-auto max-w-2xl p-4">
        {/* Coming Soon Overlay */}
        <div className="absolute inset-0 z-20 flex items-start justify-center pt-32">
          <div className="mx-4 flex max-w-sm flex-col items-center gap-4 rounded-2xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-light)]">
              <Lock className="h-8 w-8 text-[var(--brand)]" />
            </div>
            <h2 className="text-center text-lg font-bold text-gray-900">
              客戶管理功能即將推出
            </h2>
            <p className="text-center text-sm text-gray-500">
              升級專業版即可使用
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>記錄每位客戶的偏好與備註</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>自訂標籤分類客戶</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>追蹤服務歷史與回訪次數</span>
              </div>
            </div>
            <Button
              className="mt-4 w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
              disabled
            >
              敬請期待
            </Button>
          </div>
        </div>

        {/* Blurred Preview Content */}
        <div className="pointer-events-none select-none blur-[3px]">
          {/* Stats bar */}
          <div className="mb-4 flex gap-3">
            <Card className="flex-1">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-[var(--brand)]">29</p>
                <p className="text-xs text-gray-400">總客戶數</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-[var(--brand)]">5</p>
                <p className="text-xs text-gray-400">本月服務</p>
              </CardContent>
            </Card>
            <Card className="flex-1">
              <CardContent className="p-3 text-center">
                <p className="text-2xl font-bold text-[var(--brand)]">3</p>
                <p className="text-xs text-gray-400">VIP 客戶</p>
              </CardContent>
            </Card>
          </div>

          {/* Preview customer list */}
          <div className="space-y-3">
            {PREVIEW_CUSTOMERS.map((customer) => (
              <Card key={customer.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-[var(--brand-light)] text-sm text-[var(--brand-dark)]">
                        {customer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{customer.name}</p>
                        <span className="text-xs text-gray-400">
                          回訪 {customer.visits} 次
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                        <Calendar className="h-3 w-3" />
                        最近服務：{customer.lastVisit}
                      </div>
                      <p className="mt-2 flex items-start gap-1 text-sm text-gray-600">
                        <MessageSquare className="mt-0.5 h-3 w-3 shrink-0 text-gray-300" />
                        {customer.note}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {customer.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-[10px]">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
