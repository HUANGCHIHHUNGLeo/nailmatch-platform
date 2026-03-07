"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Customer {
  id: string;
  display_name: string;
  line_user_id: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  terms_accepted_at: string | null;
  request_count: number;
  has_line: boolean;
}

interface ServiceRequest {
  id: string;
  customer_id: string;
  locations: string[];
  services: string[];
  customer_gender: string;
  budget_range: string;
  preferred_date: string;
  preferred_time: string | null;
  status: string;
  notified_count: number;
  viewed_count: number;
  customer_name: string | null;
  customer_phone: string | null;
  consented_at: string | null;
  created_at: string;
  customers: { display_name: string } | null;
  response_count: number;
}

interface Booking {
  id: string;
  booking_date: string | null;
  booking_time: string | null;
  final_price: number | null;
  status: string;
  created_at: string;
  artists: { display_name: string } | null;
  customers: { display_name: string } | null;
  service_requests: { services: string[]; locations: string[] } | null;
}

const STATUS_COLORS: Record<string, string> = {
  matching: "bg-blue-100 text-blue-800",
  confirmed: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  pending: "bg-yellow-100 text-yellow-800",
  no_show: "bg-orange-100 text-orange-800",
};

const STATUS_LABELS: Record<string, string> = {
  matching: "配對中",
  confirmed: "已確認",
  completed: "已完成",
  cancelled: "已取消",
  pending: "等待中",
  no_show: "未到場",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

interface AuditLog {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

interface Analytics {
  trend: { date: string; customers: number; requests: number; bookings: number; responses: number }[];
  topServices: { name: string; count: number }[];
  topLocations: { name: string; count: number }[];
  budgetDistribution: Record<string, number>;
  funnel: { requests: number; responses: number; bookings: number; completed: number; reviews: number };
  revenue: { total: number; average: number; count: number };
  avgRating: number;
  statusBreakdown: Record<string, number>;
  period: { from: string; to: string };
}

export default function AdminDataPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totals, setTotals] = useState({ customers: 0, requests: 0, bookings: 0 });
  const [pages, setPages] = useState({ customers: 1, requests: 1, bookings: 1 });
  const [hasMore, setHasMore] = useState({ customers: false, requests: false, bookings: false });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [auditHasMore, setAuditHasMore] = useState(false);
  const [auditPage, setAuditPage] = useState(1);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState<"analytics" | "customers" | "requests" | "bookings" | "audit">("analytics");
  const PAGE_LIMIT = 30;

  useEffect(() => {
    async function fetchAll() {
      try {
        const [custRes, reqRes, bookRes, analyticsRes, auditRes] = await Promise.all([
          fetch(`/api/admin/customers?limit=${PAGE_LIMIT}`),
          fetch(`/api/admin/requests?limit=${PAGE_LIMIT}`),
          fetch(`/api/admin/bookings?limit=${PAGE_LIMIT}`),
          fetch("/api/admin/analytics"),
          fetch(`/api/admin/audit-logs?limit=${PAGE_LIMIT}`),
        ]);

        if (custRes.status === 401) {
          router.push("/admin/login");
          return;
        }

        const custData: PaginatedResult<Customer> = await custRes.json();
        const reqData: PaginatedResult<ServiceRequest> = await reqRes.json();
        const bookData: PaginatedResult<Booking> = await bookRes.json();
        if (analyticsRes.ok) setAnalytics(await analyticsRes.json());
        if (auditRes.ok) {
          const auditData: PaginatedResult<AuditLog> = await auditRes.json();
          setAuditLogs(auditData.data || []);
          setAuditTotal(auditData.total || 0);
          setAuditHasMore(!!auditData.hasMore);
        }

        setCustomers(custData.data || []);
        setRequests(reqData.data || []);
        setBookings(bookData.data || []);
        setTotals({ customers: custData.total || 0, requests: reqData.total || 0, bookings: bookData.total || 0 });
        setHasMore({ customers: !!custData.hasMore, requests: !!reqData.hasMore, bookings: !!bookData.hasMore });
      } catch (err) {
        console.error("Failed to fetch admin data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [router]);

  const loadMore = async (type: "customers" | "requests" | "bookings") => {
    setLoadingMore(true);
    const nextPage = pages[type] + 1;
    try {
      const res = await fetch(`/api/admin/${type}?page=${nextPage}&limit=${PAGE_LIMIT}`);
      if (!res.ok) return;
      const result: PaginatedResult<Customer & ServiceRequest & Booking> = await res.json();

      if (type === "customers") {
        setCustomers((prev) => [...prev, ...(result.data as Customer[])]);
      } else if (type === "requests") {
        setRequests((prev) => [...prev, ...(result.data as ServiceRequest[])]);
      } else {
        setBookings((prev) => [...prev, ...(result.data as Booking[])]);
      }
      setPages((prev) => ({ ...prev, [type]: nextPage }));
      setHasMore((prev) => ({ ...prev, [type]: result.hasMore }));
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadMoreAudit = async () => {
    setLoadingMore(true);
    const nextPage = auditPage + 1;
    try {
      const res = await fetch(`/api/admin/audit-logs?page=${nextPage}&limit=${PAGE_LIMIT}`);
      if (!res.ok) return;
      const result: PaginatedResult<AuditLog> = await res.json();
      setAuditLogs((prev) => [...prev, ...result.data]);
      setAuditPage(nextPage);
      setAuditHasMore(result.hasMore);
    } catch (err) {
      console.error("Failed to load more audit logs:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
              ← 回管理首頁
            </Link>
            <h1 className="text-lg font-bold text-gray-900">資料統計</h1>
          </div>
          <Link href="/admin/report">
            <Button variant="outline" size="sm">MVP 報告</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl p-4">
        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-[var(--brand)]">{totals.customers}</p>
              <p className="text-xs text-gray-500">客戶總數</p>
              <p className="text-xs text-green-600">{customers.filter((c) => c.has_line).length}+ 已綁 LINE</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">{totals.requests}</p>
              <p className="text-xs text-gray-500">需求總數</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-600">{totals.bookings}</p>
              <p className="text-xs text-gray-500">預約總數</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-600">
                {totals.requests > 0 ? Math.round((totals.bookings / totals.requests) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500">需求→預約轉換率</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1">
          {([
            ["analytics", "趨勢分析"],
            ["customers", `客戶 (${totals.customers})`],
            ["requests", `需求 (${totals.requests})`],
            ["bookings", `預約 (${totals.bookings})`],
            ["audit", `操作紀錄 (${auditTotal})`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                tab === key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

          {/* Analytics Dashboard */}
          {tab === "analytics" && analytics && (
            <div className="space-y-4">
              {/* Conversion Funnel */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">轉換漏斗（近 30 天）</h3>
                  <div className="space-y-2">
                    {[
                      { label: "需求送出", value: analytics.funnel.requests, color: "bg-blue-500" },
                      { label: "設計師報價", value: analytics.funnel.responses, color: "bg-indigo-500" },
                      { label: "確認預約", value: analytics.funnel.bookings, color: "bg-green-500" },
                      { label: "完成服務", value: analytics.funnel.completed, color: "bg-emerald-500" },
                      { label: "留下評價", value: analytics.funnel.reviews, color: "bg-purple-500" },
                    ].map((step) => {
                      const pct = analytics.funnel.requests > 0 ? (step.value / analytics.funnel.requests) * 100 : 0;
                      return (
                        <div key={step.label} className="flex items-center gap-3">
                          <span className="w-20 flex-shrink-0 text-xs text-gray-500">{step.label}</span>
                          <div className="flex-1 rounded-full bg-gray-100 h-5 overflow-hidden">
                            <div className={`h-full ${step.color} rounded-full transition-all`} style={{ width: `${Math.max(pct, 2)}%` }} />
                          </div>
                          <span className="w-16 flex-shrink-0 text-right text-xs font-medium">{step.value} ({Math.round(pct)}%)</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Daily Trend */}
              <Card>
                <CardContent className="p-4">
                  <h3 className="mb-3 text-sm font-semibold text-gray-700">
                    每日趨勢（{analytics.period.from} ~ {analytics.period.to}）
                  </h3>
                  <div className="flex items-end gap-[2px] h-32 overflow-x-auto">
                    {analytics.trend.map((day) => {
                      const total = day.customers + day.requests + day.bookings;
                      const maxVal = Math.max(...analytics.trend.map((d) => d.customers + d.requests + d.bookings), 1);
                      const height = (total / maxVal) * 100;
                      return (
                        <div key={day.date} className="flex-1 min-w-[8px] group relative flex flex-col items-center justify-end h-full">
                          <div
                            className="w-full rounded-t bg-[var(--brand)] opacity-80 hover:opacity-100 transition min-h-[2px]"
                            style={{ height: `${Math.max(height, 2)}%` }}
                          />
                          <div className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-[10px] text-white z-10">
                            {day.date.slice(5)}: {day.requests}需求 {day.bookings}預約 {day.customers}新客
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                    <span>{analytics.trend[0]?.date.slice(5)}</span>
                    <span>{analytics.trend[analytics.trend.length - 1]?.date.slice(5)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Top Services */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">熱門服務 Top 10</h3>
                    <div className="space-y-2">
                      {analytics.topServices.map((s, i) => {
                        const maxCount = analytics.topServices[0]?.count || 1;
                        return (
                          <div key={s.name} className="flex items-center gap-2">
                            <span className="w-4 text-xs text-gray-400">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-700">{s.name}</span>
                                <span className="font-medium">{s.count}</span>
                              </div>
                              <div className="mt-0.5 h-1.5 rounded-full bg-gray-100">
                                <div className="h-full rounded-full bg-[var(--brand)]" style={{ width: `${(s.count / maxCount) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {analytics.topServices.length === 0 && (
                        <p className="text-xs text-gray-400">尚無資料</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Locations */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">熱門地區</h3>
                    <div className="space-y-2">
                      {analytics.topLocations.map((l, i) => {
                        const maxCount = analytics.topLocations[0]?.count || 1;
                        return (
                          <div key={l.name} className="flex items-center gap-2">
                            <span className="w-4 text-xs text-gray-400">{i + 1}</span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-700">{l.name}</span>
                                <span className="font-medium">{l.count}</span>
                              </div>
                              <div className="mt-0.5 h-1.5 rounded-full bg-gray-100">
                                <div className="h-full rounded-full bg-blue-500" style={{ width: `${(l.count / maxCount) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {analytics.topLocations.length === 0 && (
                        <p className="text-xs text-gray-400">尚無資料</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Budget Distribution */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">預算分佈</h3>
                    <div className="space-y-2">
                      {Object.entries(analytics.budgetDistribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([range, count]) => {
                          const maxCount = Math.max(...Object.values(analytics.budgetDistribution), 1);
                          return (
                            <div key={range} className="flex items-center gap-2">
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-gray-700">{range}</span>
                                  <span className="font-medium">{count}</span>
                                </div>
                                <div className="mt-0.5 h-1.5 rounded-full bg-gray-100">
                                  <div className="h-full rounded-full bg-green-500" style={{ width: `${(count / maxCount) * 100}%` }} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </CardContent>
                </Card>

                {/* Revenue & Ratings */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-3 text-sm font-semibold text-gray-700">營收與評價</h3>
                    <div className="space-y-3">
                      <div className="rounded-lg bg-green-50 p-3">
                        <p className="text-xs text-green-600">平台總成交額（30天）</p>
                        <p className="text-xl font-bold text-green-700">NT${analytics.revenue.total.toLocaleString()}</p>
                        <p className="text-xs text-green-500">{analytics.revenue.count} 筆完成・平均 NT${analytics.revenue.average.toLocaleString()}</p>
                      </div>
                      <div className="rounded-lg bg-purple-50 p-3">
                        <p className="text-xs text-purple-600">平均評價</p>
                        <p className="text-xl font-bold text-purple-700">
                          {analytics.avgRating > 0 ? `${analytics.avgRating} / 5.0` : "尚無評價"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Customers Table */}
          {tab === "customers" && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                        <th className="px-4 py-3">姓名</th>
                        <th className="px-4 py-3">LINE</th>
                        <th className="px-4 py-3">電話</th>
                        <th className="px-4 py-3">需求數</th>
                        <th className="px-4 py-3">同意條款</th>
                        <th className="px-4 py-3">註冊時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((c) => (
                        <tr key={c.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">{c.display_name}</td>
                          <td className="px-4 py-3">
                            {c.has_line ? (
                              <Badge className="bg-green-100 text-green-700 text-[10px]">已綁定</Badge>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-500 text-[10px]">匿名</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{c.phone || "-"}</td>
                          <td className="px-4 py-3">{c.request_count}</td>
                          <td className="px-4 py-3">
                            {c.terms_accepted_at ? (
                              <Badge className="bg-green-100 text-green-700 text-[10px]">已同意</Badge>
                            ) : (
                              <span className="text-gray-300">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{formatDate(c.created_at)}</td>
                        </tr>
                      ))}
                      {customers.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">尚無客戶資料</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {hasMore.customers && (
                  <div className="border-t p-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => loadMore("customers")} disabled={loadingMore}>
                      {loadingMore ? "載入中..." : `載入更多（已載入 ${customers.length}/${totals.customers}）`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Requests Table */}
          {tab === "requests" && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                        <th className="px-4 py-3">客戶</th>
                        <th className="px-4 py-3">服務</th>
                        <th className="px-4 py-3">地點</th>
                        <th className="px-4 py-3">預算</th>
                        <th className="px-4 py-3">狀態</th>
                        <th className="px-4 py-3">通知/查看/報價</th>
                        <th className="px-4 py-3">時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requests.map((r) => (
                        <tr key={r.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="font-medium">{r.customer_name || r.customers?.display_name || "匿名"}</p>
                            {r.customer_phone && (
                              <p className="text-xs text-gray-400">{r.customer_phone}</p>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {r.services.slice(0, 2).map((s) => (
                                <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                              ))}
                              {r.services.length > 2 && (
                                <Badge variant="secondary" className="text-[10px]">+{r.services.length - 2}</Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs">{r.locations.join("、").substring(0, 15)}</td>
                          <td className="px-4 py-3 text-xs font-medium text-[var(--brand)]">{r.budget_range}</td>
                          <td className="px-4 py-3">
                            <Badge className={`text-[10px] ${STATUS_COLORS[r.status] || "bg-gray-100"}`}>
                              {STATUS_LABELS[r.status] || r.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {r.notified_count}/{r.viewed_count}/{r.response_count}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{formatDate(r.created_at)}</td>
                        </tr>
                      ))}
                      {requests.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">尚無需求資料</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {hasMore.requests && (
                  <div className="border-t p-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => loadMore("requests")} disabled={loadingMore}>
                      {loadingMore ? "載入中..." : `載入更多（已載入 ${requests.length}/${totals.requests}）`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Bookings Table */}
          {tab === "bookings" && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                        <th className="px-4 py-3">客戶</th>
                        <th className="px-4 py-3">設計師</th>
                        <th className="px-4 py-3">服務</th>
                        <th className="px-4 py-3">日期</th>
                        <th className="px-4 py-3">金額</th>
                        <th className="px-4 py-3">狀態</th>
                        <th className="px-4 py-3">建立時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((b) => (
                        <tr key={b.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium">
                            {b.customers?.display_name || "匿名"}
                          </td>
                          <td className="px-4 py-3">{b.artists?.display_name || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {b.service_requests?.services?.slice(0, 2).map((s) => (
                                <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            {b.booking_date || "待定"} {b.booking_time || ""}
                          </td>
                          <td className="px-4 py-3 font-medium text-[var(--brand)]">
                            {b.final_price ? `NT$${b.final_price.toLocaleString()}` : "-"}
                          </td>
                          <td className="px-4 py-3">
                            <Badge className={`text-[10px] ${STATUS_COLORS[b.status] || "bg-gray-100"}`}>
                              {STATUS_LABELS[b.status] || b.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{formatDate(b.created_at)}</td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">尚無預約資料</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {hasMore.bookings && (
                  <div className="border-t p-3 text-center">
                    <Button variant="ghost" size="sm" onClick={() => loadMore("bookings")} disabled={loadingMore}>
                      {loadingMore ? "載入中..." : `載入更多（已載入 ${bookings.length}/${totals.bookings}）`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Audit Logs */}
          {tab === "audit" && (
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-xs text-gray-500">
                        <th className="px-4 py-3">操作</th>
                        <th className="px-4 py-3">對象</th>
                        <th className="px-4 py-3">詳情</th>
                        <th className="px-4 py-3">IP</th>
                        <th className="px-4 py-3">時間</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Badge className={`text-[10px] ${getAuditActionColor(log.action)}`}>
                              {getAuditActionLabel(log.action)}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {log.entity_type && (
                              <span>{log.entity_type}{log.entity_id ? ` #${log.entity_id.slice(0, 8)}` : ""}</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {formatAuditDetails(log.details)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400 font-mono">{log.ip_address || "-"}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">{formatDate(log.created_at)}</td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">尚無操作紀錄</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {auditHasMore && (
                  <div className="border-t p-3 text-center">
                    <Button variant="ghost" size="sm" onClick={loadMoreAudit} disabled={loadingMore}>
                      {loadingMore ? "載入中..." : `載入更多（已載入 ${auditLogs.length}/${auditTotal}）`}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
      </main>
    </div>
  );
}

const AUDIT_ACTION_LABELS: Record<string, string> = {
  "admin.login": "管理員登入",
  "artist.approve": "核准設計師",
  "artist.reject": "拒絕設計師",
  "richmenu.setup": "設定 Rich Menu",
  "richmenu.delete": "刪除 Rich Menu",
};

const AUDIT_ACTION_COLORS: Record<string, string> = {
  "admin.login": "bg-blue-100 text-blue-800",
  "artist.approve": "bg-green-100 text-green-800",
  "artist.reject": "bg-red-100 text-red-800",
  "richmenu.setup": "bg-purple-100 text-purple-800",
  "richmenu.delete": "bg-orange-100 text-orange-800",
};

function getAuditActionLabel(action: string) {
  return AUDIT_ACTION_LABELS[action] || action;
}

function getAuditActionColor(action: string) {
  return AUDIT_ACTION_COLORS[action] || "bg-gray-100 text-gray-800";
}

function formatAuditDetails(details: Record<string, unknown>) {
  if (!details || Object.keys(details).length === 0) return "-";
  const parts: string[] = [];
  if (details.artistName) parts.push(`設計師: ${details.artistName}`);
  if (details.deleted !== undefined) parts.push(`刪除: ${details.deleted} 個`);
  if (details.customerMenuId) parts.push("客戶選單已建立");
  if (details.artistMenuId) parts.push("設計師選單已建立");
  return parts.length > 0 ? parts.join("、") : JSON.stringify(details).slice(0, 60);
}
