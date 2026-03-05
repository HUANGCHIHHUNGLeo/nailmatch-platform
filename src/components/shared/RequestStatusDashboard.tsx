"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { REQUEST_STATUS } from "@/lib/utils/constants";

interface RequestStatusDashboardProps {
  status: keyof typeof REQUEST_STATUS;
  notifiedCount: number;
  viewedCount: number;
  quoteCount: number;
  services: string[];
  budget: string;
  location: string;
  date: string;
}

export function RequestStatusDashboard({
  status,
  notifiedCount,
  viewedCount,
  quoteCount,
  services,
  budget,
  location,
  date,
}: RequestStatusDashboardProps) {
  const statusInfo = REQUEST_STATUS[status];

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">需求狀態</h2>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>

          {/* Stats Grid */}
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div className="rounded-xl bg-blue-50 p-3">
              <p className="text-2xl font-bold text-blue-600">{notifiedCount}</p>
              <p className="text-xs text-blue-500">已通知美甲師</p>
            </div>
            <div className="rounded-xl bg-purple-50 p-3">
              <p className="text-2xl font-bold text-purple-600">{viewedCount}</p>
              <p className="text-xs text-purple-500">正在查看</p>
            </div>
            <div className="rounded-xl bg-pink-50 p-3">
              <p className="text-2xl font-bold text-pink-600">{quoteCount}</p>
              <p className="text-xs text-pink-500">已收到報價</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Request Summary */}
      <Card>
        <CardContent className="p-4">
          <h3 className="mb-3 font-semibold text-gray-700">需求摘要</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">服務項目</span>
              <span className="font-medium">{services.join("、")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">地點</span>
              <span className="font-medium">{location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">預算</span>
              <span className="font-medium">{budget}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">時間</span>
              <span className="font-medium">{date}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
