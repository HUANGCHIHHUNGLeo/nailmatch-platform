"use client";

import { useMemo } from "react";
import Link from "next/link";
import { User, Image as ImageIcon, Calendar, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthSWR } from "@/lib/line/use-auth-swr";

import { useLanguage } from "@/lib/i18n/LanguageContext";


interface ArtistMe {
  id: string;
  display_name: string;
  is_verified: boolean;
}

interface ServiceRequest {
  id: string;
  services: string[];
  locations: string[];
  budget_range: string;
  preferred_date: string;
  preferred_time: string | null;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  booking_date: string | null;
  final_price: number | null;
  status: string;
  service_requests: { services: string[]; locations: string[] };
  customers: { display_name: string };
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "剛剛";
  if (mins < 60) return `${mins} 分鐘前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小時前`;
  return `${Math.floor(hours / 24)} 天前`;
}

export default function ArtistDashboard() {
  const { t } = useLanguage();
  const { data: me } = useAuthSWR<ArtistMe>("/api/artists/me");
  const { data: requests } = useAuthSWR<ServiceRequest[]>("/api/requests/matching");
  const { data: bookings } = useAuthSWR<Booking[]>(
    me?.id ? `/api/bookings?artistId=${me.id}` : null
  );

  const loading = !me && !requests;
  const artistName = me?.display_name || "";
  const requestList = requests || [];
  const bookingList = bookings || [];

  const stats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    return {
      todayBookings: bookingList.filter(
        (b) => b.status === "confirmed" && b.booking_date === today
      ).length,
      pendingRequests: requestList.length,
      totalQuotes: bookingList.length,
      monthlyEarnings: bookingList
        .filter((b) => b.status === "completed" && new Date(b.booking_date || "") >= monthStart)
        .reduce((sum, b) => sum + (b.final_price || 0), 0),
    };
  }, [bookingList, requestList]);

  const confirmedBookings = bookingList.filter((b) => b.status === "confirmed");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  if (!artistName && requestList.length === 0 && bookingList.length === 0) {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    const liffUrl = liffId ? `https://liff.line.me/${liffId}/artist-form` : null;
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)] p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <h2 className="mb-2 text-xl font-bold text-gray-900">請先登入</h2>
          <p className="mb-6 text-sm text-gray-500">
            設計師後台需要透過 LINE 登入才能使用。
          </p>
          <div className="space-y-3">
            {liffUrl && (
              <a
                href={liffUrl}
                className="block w-full rounded-lg bg-[#06C755] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#05a647]"
              >
                用 LINE 開啟
              </a>
            )}
            <a href="/" className="block rounded-lg border border-gray-200 px-6 py-3 text-sm font-medium text-gray-600 transition hover:bg-gray-50">
              回首頁
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-[var(--brand)]">NaLi Match</h1>
          <Link href="/artist/settings" className="text-sm text-gray-500">
            {t.nav.settings}
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {artistName && (
          <p className="mb-4 text-sm text-gray-500">
            {t.dashboard.greeting}{artistName}
          </p>
        )}

        {me && !me.is_verified && (
          <Card className="mb-4 border-yellow-200 bg-yellow-50">
            <CardContent className="p-4 text-center">
              <p className="font-medium text-yellow-800">帳號審核中</p>
              <p className="mt-1 text-sm text-yellow-600">
                管理員正在審核您的資料，審核通過後即可接收客戶需求並報價。
              </p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-[var(--brand)]">{stats.todayBookings}</p>
              <p className="text-sm text-gray-500">{t.dashboard.stats.todayBookings}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-[var(--brand-dark)]">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500">{t.dashboard.stats.pendingRequests}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-[var(--brand-darker)]">{stats.totalQuotes}</p>
              <p className="text-sm text-gray-500">{t.dashboard.stats.totalOrders}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-emerald-600">
                NT${stats.monthlyEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">{t.dashboard.stats.monthlyEarnings}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests">
          <TabsList className="w-full">
            <TabsTrigger value="requests" className="flex-1">
              {t.dashboard.tabs.newRequests}
              {requestList.length > 0 && (
                <Badge variant="secondary" className="ml-1">{requestList.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1">
              {t.dashboard.tabs.myBookings}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4 space-y-3">
            {requestList.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-400">
                  <p>{t.dashboard.emptyState.noRequests}</p>
                  <p className="mt-1 text-sm">{t.dashboard.emptyState.notifyViaLine}</p>
                </CardContent>
              </Card>
            ) : (
              requestList.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex flex-wrap gap-1">
                          {request.services.map((service) => (
                            <Badge key={service} variant="secondary" className="text-xs">
                              {service}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          <p>地點：{request.locations.join("、")}</p>
                          <p>預算：{request.budget_range}</p>
                          <p>時間：{request.preferred_date} {request.preferred_time || ""}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">
                        {timeAgo(request.created_at)}
                      </span>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" asChild>
                        <Link href={`/artist/requests/${request.id}`}>查看詳情</Link>
                      </Button>
                      <Button size="sm" className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)]" asChild>
                        <Link href={`/artist/requests/${request.id}`}>立即報價</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="bookings" className="mt-4 space-y-3">
            {confirmedBookings.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-400">
                  <p>目前沒有已確認的預約</p>
                  <p className="mt-1 text-sm">接單後預約會顯示在這裡</p>
                </CardContent>
              </Card>
            ) : (
              confirmedBookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{booking.customers?.display_name}</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {booking.service_requests?.services.map((s) => (
                            <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                          ))}
                        </div>
                        {booking.final_price && (
                          <p className="mt-2 text-sm font-medium text-[var(--brand)]">
                            NT${booking.final_price.toLocaleString()}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-green-100 text-green-800">已確認</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button variant="outline" asChild className="h-auto py-4">
            <Link href="/artist/profile" className="flex flex-col items-center">
              <User className="h-6 w-6 text-gray-600 mb-1" />
              <span className="text-sm">編輯個人檔案</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto py-4">
            <Link href="/artist/portfolio" className="flex flex-col items-center">
              <ImageIcon className="h-6 w-6 text-gray-600 mb-1" />
              <span className="text-sm">管理作品集</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto py-4">
            <Link href="/artist/availability" className="flex flex-col items-center">
              <Calendar className="h-6 w-6 text-gray-600 mb-1" />
              <span className="text-sm">時段管理</span>
            </Link>
          </Button>
          <Button variant="outline" asChild className="h-auto py-4">
            <Link href="/artist/bookings" className="flex flex-col items-center">
              <ClipboardList className="h-6 w-6 text-gray-600 mb-1" />
              <span className="text-sm">預約紀錄</span>
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
