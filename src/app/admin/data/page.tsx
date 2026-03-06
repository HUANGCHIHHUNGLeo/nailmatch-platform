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

export default function AdminDataPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totals, setTotals] = useState({ customers: 0, requests: 0, bookings: 0 });
  const [pages, setPages] = useState({ customers: 1, requests: 1, bookings: 1 });
  const [hasMore, setHasMore] = useState({ customers: false, requests: false, bookings: false });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [tab, setTab] = useState<"customers" | "requests" | "bookings">("customers");
  const PAGE_LIMIT = 30;

  useEffect(() => {
    async function fetchAll() {
      try {
        const [custRes, reqRes, bookRes] = await Promise.all([
          fetch(`/api/admin/customers?limit=${PAGE_LIMIT}`),
          fetch(`/api/admin/requests?limit=${PAGE_LIMIT}`),
          fetch(`/api/admin/bookings?limit=${PAGE_LIMIT}`),
        ]);

        if (custRes.status === 401) {
          router.push("/admin/login");
          return;
        }

        const custData: PaginatedResult<Customer> = await custRes.json();
        const reqData: PaginatedResult<ServiceRequest> = await reqRes.json();
        const bookData: PaginatedResult<Booking> = await bookRes.json();

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
            ["customers", `客戶 (${totals.customers})`],
            ["requests", `需求 (${totals.requests})`],
            ["bookings", `預約 (${totals.bookings})`],
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
      </main>
    </div>
  );
}
