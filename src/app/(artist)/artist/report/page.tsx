"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, TrendingUp, DollarSign, Calendar, BarChart3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";
import { useLiff } from "@/lib/line/liff";

interface Booking {
  id: string;
  booking_date: string | null;
  final_price: number | null;
  status: string;
  created_at: string;
  service_requests: {
    services: string[];
    locations: string[];
  };
  customers: {
    display_name: string;
  };
}

interface MonthlyStats {
  month: string;
  revenue: number;
  count: number;
}

const IS_PREMIUM = false; // 未來付費解鎖

export default function ArtistReportPage() {
  const router = useRouter();
  const { isReady, isLoggedIn } = useLiff();
  const { authFetch } = useAuthFetch();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !isLoggedIn) return;
    async function fetchData() {
      try {
        const meRes = await authFetch("/api/artists/me");
        if (!meRes.ok) return;
        const me = await meRes.json();

        const res = await authFetch(`/api/bookings?artistId=${me.id}`);
        if (res.ok) {
          setBookings(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch report data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [isReady, isLoggedIn, authFetch]);

  const completed = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completed.reduce((sum, b) => sum + (b.final_price || 0), 0);
  const avgPrice = completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0;

  // 按月份分組
  const monthlyStats: MonthlyStats[] = [];
  const monthMap = new Map<string, { revenue: number; count: number }>();
  completed.forEach((b) => {
    const date = b.booking_date || b.created_at;
    const month = date.slice(0, 7); // YYYY-MM
    const existing = monthMap.get(month) || { revenue: 0, count: 0 };
    existing.revenue += b.final_price || 0;
    existing.count += 1;
    monthMap.set(month, existing);
  });
  Array.from(monthMap.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .forEach(([month, stats]) => {
      monthlyStats.push({ month, ...stats });
    });

  // 本月數據
  const currentMonth = new Date().toISOString().slice(0, 7);
  const thisMonthStats = monthMap.get(currentMonth) || { revenue: 0, count: 0 };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button onClick={() => router.back()} className="flex items-center text-sm text-gray-500">
            <ArrowLeft className="mr-1 h-4 w-4" /> 返回
          </button>
          <h1 className="text-lg font-semibold text-[var(--brand)]">業績報表</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-4 p-4">
        {/* 本月摘要 */}
        <Card>
          <CardContent className="p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">本月摘要</h2>
              <Badge variant="outline" className="text-xs">
                {currentMonth.replace("-", " 年 ")} 月
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--brand-light)]/30 p-3 text-center">
                <p className="text-2xl font-bold text-[var(--brand)]">
                  {thisMonthStats.count}
                </p>
                <p className="text-xs text-gray-500">完成單數</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  NT${thisMonthStats.revenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">本月收入</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 累計數據 */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 font-semibold text-gray-900">累計數據</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <p className="text-lg font-bold text-gray-900">{completed.length}</p>
                <p className="text-xs text-gray-500">總完成單數</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
                  <DollarSign className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-lg font-bold text-gray-900">
                  NT${totalRevenue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">總收入</p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <p className="text-lg font-bold text-gray-900">
                  NT${avgPrice.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">平均客單價</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 月度明細 — 鎖定 */}
        <div className="relative">
          <Card className={!IS_PREMIUM ? "opacity-60" : ""}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-gray-400" />
                <h2 className="font-semibold text-gray-900">月度明細</h2>
              </div>
              {monthlyStats.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-400">
                  <p>尚無完成的預約紀錄</p>
                  <p className="mt-1 text-xs">完成服務後，業績數據會顯示在這裡</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {monthlyStats.slice(0, IS_PREMIUM ? undefined : 2).map((m) => (
                    <div
                      key={m.month}
                      className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {m.month.replace("-", " 年 ")} 月
                        </p>
                        <p className="text-xs text-gray-500">{m.count} 筆完成</p>
                      </div>
                      <p className="font-semibold text-emerald-600">
                        NT${m.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                  {!IS_PREMIUM && monthlyStats.length > 2 && (
                    <div className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 p-3 text-xs text-gray-400">
                      還有 {monthlyStats.length - 2} 個月份...
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 付費鎖定提示 */}
          {!IS_PREMIUM && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-2xl bg-white/95 px-6 py-5 text-center shadow-lg backdrop-blur-sm">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--brand-light)]">
                  <Lock className="h-6 w-6 text-[var(--brand)]" />
                </div>
                <p className="text-sm font-semibold text-gray-900">進階報表功能</p>
                <p className="mt-1 text-xs text-gray-500">
                  完整月度分析、趨勢圖表、匯出報表
                </p>
                <Badge variant="outline" className="mt-3 border-[var(--brand)] text-[var(--brand)]">
                  即將推出
                </Badge>
              </div>
            </div>
          )}
        </div>

        {/* 完成紀錄列表 */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 font-semibold text-gray-900">最近完成紀錄</h2>
            {completed.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">
                尚無完成紀錄
              </div>
            ) : (
              <div className="space-y-2">
                {completed.slice(0, 10).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {booking.customers?.display_name || "顧客"}
                      </p>
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {booking.service_requests?.services.slice(0, 2).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-400">
                        {booking.booking_date || booking.created_at.slice(0, 10)}
                      </p>
                    </div>
                    <p className="ml-3 font-semibold text-emerald-600">
                      {booking.final_price
                        ? `NT$${booking.final_price.toLocaleString()}`
                        : "—"}
                    </p>
                  </div>
                ))}
                {completed.length > 10 && (
                  <p className="pt-2 text-center text-xs text-gray-400">
                    共 {completed.length} 筆紀錄
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
