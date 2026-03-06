"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LiffProvider, useLiff } from "@/lib/line/liff";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sparkles, Calendar, Clock, MapPin, Loader2 } from "lucide-react";

interface ServiceRequest {
  id: string;
  services: string[];
  locations: string[];
  budget_range: string;
  preferred_date: string;
  preferred_time: string | null;
  status: string;
  created_at: string;
  notified_count: number;
  response_count: number;
}

interface Booking {
  id: string;
  booking_date: string | null;
  booking_time: string | null;
  final_price: number | null;
  status: string;
  created_at: string;
  artists: {
    display_name: string;
    avatar_url: string | null;
  };
  service_requests: {
    services: string[];
    locations: string[];
  };
}

const REQUEST_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "等待中", color: "bg-yellow-100 text-yellow-800" },
  matching: { label: "配對中", color: "bg-blue-100 text-blue-800" },
  matched: { label: "已配對", color: "bg-purple-100 text-purple-800" },
  confirmed: { label: "已確認", color: "bg-green-100 text-green-800" },
  completed: { label: "已完成", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
  expired: { label: "已過期", color: "bg-gray-100 text-gray-500" },
};

const BOOKING_STATUS: Record<string, { label: string; color: string }> = {
  confirmed: { label: "已確認", color: "bg-green-100 text-green-800" },
  completed: { label: "已完成", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
  no_show: { label: "未到場", color: "bg-yellow-100 text-yellow-800" },
};

function MyPageContent() {
  const { isReady, isLoggedIn, needsLogin, error, profile } = useLiff();
  const { authFetch } = useAuthFetch();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isReady || !isLoggedIn) return;

    async function fetchData() {
      try {
        const [reqRes, bookRes] = await Promise.all([
          authFetch("/api/requests"),
          authFetch("/api/bookings"),
        ]);

        if (reqRes.ok) setRequests(await reqRes.json());
        if (bookRes.ok) setBookings(await bookRes.json());
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [isReady, isLoggedIn, authFetch]);

  const handleDeleteAccount = async () => {
    const confirmFirst = confirm(
      "確定要刪除帳號嗎？\n\n刪除後將無法復原，所有需求紀錄和預約資料都會被永久移除。"
    );
    if (!confirmFirst) return;

    const confirmSecond = confirm("再次確認：刪除帳號後無法復原。確定要刪除嗎？");
    if (!confirmSecond) return;

    setDeleting(true);
    try {
      const res = await authFetch("/api/customers/me", { method: "DELETE" });
      if (res.ok) {
        alert("帳號已成功刪除");
        window.location.href = "/";
      } else {
        const data = await res.json().catch(() => null);
        alert(data?.error || "刪除失敗，請稍後再試");
      }
    } catch {
      alert("網路錯誤，請檢查連線後重試");
    } finally {
      setDeleting(false);
    }
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  if (needsLogin || error) {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    const liffUrl = liffId ? `https://liff.line.me/${liffId}/customer-form` : null;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)] p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg viewBox="0 0 24 24" className="h-9 w-9 text-green-500" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">請透過 LINE 登入</h2>
            <p className="mb-6 text-sm text-gray-500">
              登入後即可查看您的需求紀錄與預約狀態。
            </p>
            <div className="space-y-3">
              {liffUrl && (
                <button
                  onClick={() => { window.location.href = liffUrl; }}
                  className="w-full rounded-lg bg-[#06C755] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#05a647]"
                >
                  用 LINE 登入
                </button>
              )}
              <Link
                href="/"
                className="block rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50"
              >
                回首頁
              </Link>
            </div>
            {error && (
              <p className="mt-4 text-xs text-gray-400">錯誤資訊：{error.message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold text-[var(--brand)]">
            NaLi Match
          </Link>
          <span className="text-sm font-medium text-gray-700">我的帳號</span>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {/* Profile Card */}
        {profile && (
          <Card className="mb-4">
            <CardContent className="flex items-center gap-4 p-4">
              <Avatar className="h-14 w-14">
                <AvatarImage src={profile.pictureUrl} />
                <AvatarFallback className="bg-[var(--brand-light)] text-[var(--brand-dark)] text-lg">
                  {profile.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-lg font-bold text-gray-900">{profile.displayName}</p>
                <p className="text-sm text-gray-500">
                  {requests.length} 筆需求 · {bookings.length} 筆預約
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="requests">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="requests" className="flex-1">
              我的需求
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1">
              我的預約
            </TabsTrigger>
          </TabsList>

          {/* Requests Tab */}
          <TabsContent value="requests" className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
              </div>
            ) : requests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-light)]">
                    <Sparkles className="h-8 w-8 text-[var(--brand)]" />
                  </div>
                  <p className="mb-1 font-medium text-gray-700">還沒有需求紀錄</p>
                  <p className="mb-4 text-sm text-gray-400">發佈需求，讓設計師主動為您報價</p>
                  <Button asChild className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]">
                    <Link href="/request">發佈需求</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              requests.map((req) => {
                const status = REQUEST_STATUS[req.status] || REQUEST_STATUS.pending;
                return (
                  <Link key={req.id} href={`/request/${req.id}`}>
                    <Card className="transition hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate font-medium text-gray-900">
                                {req.services.join("、")}
                              </p>
                              <Badge className={status.color}>{status.label}</Badge>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" />
                                {req.locations.slice(0, 2).join("、")}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {req.preferred_date}
                              </span>
                            </div>
                            <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
                              <span>{new Date(req.created_at).toLocaleDateString("zh-TW")}</span>
                              <span>{req.budget_range}</span>
                              {req.response_count > 0 && (
                                <span className="font-medium text-[var(--brand)]">
                                  {req.response_count} 個報價
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
              </div>
            ) : bookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-light)]">
                    <Calendar className="h-8 w-8 text-[var(--brand)]" />
                  </div>
                  <p className="mb-1 font-medium text-gray-700">還沒有預約紀錄</p>
                  <p className="mb-4 text-sm text-gray-400">選擇喜歡的報價後即可預約</p>
                  <Button asChild className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]">
                    <Link href="/request">開始找設計師</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => {
                const status = BOOKING_STATUS[booking.status] || BOOKING_STATUS.confirmed;
                return (
                  <Link key={booking.id} href={`/booking/${booking.id}`}>
                    <Card className="transition hover:shadow-md">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={booking.artists?.avatar_url || undefined} />
                            <AvatarFallback className="bg-[var(--brand-light)] text-[var(--brand-dark)]">
                              {booking.artists?.display_name?.charAt(0) || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <p className="truncate font-medium text-gray-900">
                                {booking.artists?.display_name}
                              </p>
                              <Badge className={status.color}>{status.label}</Badge>
                            </div>
                            <p className="truncate text-sm text-gray-500">
                              {booking.service_requests?.services?.join("、")}
                            </p>
                            <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {booking.booking_date || "日期待定"}
                              </span>
                              {booking.final_price && (
                                <span className="font-medium text-[var(--brand)]">
                                  NT${booking.final_price.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <div className="mt-6">
          <Button asChild className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)] h-12 text-base">
            <Link href="/request">
              <Sparkles className="mr-2 h-5 w-5" />
              發佈新需求
            </Link>
          </Button>
        </div>

        {/* Delete Account */}
        <div className="mt-8 pb-8 text-center">
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="inline-flex items-center text-xs text-gray-400 transition hover:text-red-500"
          >
            {deleting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
            刪除我的帳號
          </button>
        </div>
      </main>
    </div>
  );
}

export default function MyPage() {
  return (
    <LiffProvider requireLogin>
      <MyPageContent />
    </LiffProvider>
  );
}
