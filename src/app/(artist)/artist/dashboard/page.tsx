"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { User, Image as ImageIcon, Calendar, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ArtistMe {
  id: string;
  display_name: string;
}

interface ServiceRequest {
  id: string;
  services: string[];
  locations: string[];
  budget_range: string;
  preferred_date: string;
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
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistName, setArtistName] = useState("");
  const [stats, setStats] = useState({
    todayBookings: 0,
    pendingRequests: 0,
    totalQuotes: 0,
    monthlyEarnings: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      // Get current artist profile
      const meRes = await fetch("/api/artists/me");
      if (!meRes.ok) {
        setLoading(false);
        return;
      }
      const me: ArtistMe = await meRes.json();
      setArtistName(me.display_name);

      const [requestsRes, bookingsRes] = await Promise.all([
        fetch("/api/requests/matching"),
        fetch(`/api/bookings?artistId=${me.id}`),
      ]);

      const matchingRequests: ServiceRequest[] = requestsRes.ok ? await requestsRes.json() : [];
      const artistBookings: Booking[] = bookingsRes.ok ? await bookingsRes.json() : [];

      setRequests(matchingRequests);
      setBookings(artistBookings);

      const today = new Date().toISOString().split("T")[0];
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      setStats({
        todayBookings: artistBookings.filter(
          (b) => b.status === "confirmed" && b.booking_date === today
        ).length,
        pendingRequests: matchingRequests.length,
        totalQuotes: artistBookings.length,
        monthlyEarnings: artistBookings
          .filter((b) => b.status === "completed" && new Date(b.booking_date || "") >= monthStart)
          .reduce((sum, b) => sum + (b.final_price || 0), 0),
      });
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <h1 className="text-lg font-semibold text-pink-500">NailMatch</h1>
          <Link href="/artist/settings" className="text-sm text-gray-500">
            設定
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {artistName && (
          <p className="mb-4 text-sm text-gray-500">
            你好，{artistName}
          </p>
        )}

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-pink-500">{stats.todayBookings}</p>
              <p className="text-sm text-gray-500">今日預約</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-500">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-500">待回應需求</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-purple-500">{stats.totalQuotes}</p>
              <p className="text-sm text-gray-500">累計接單</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-500">
                NT${stats.monthlyEarnings.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">本月收入</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests">
          <TabsList className="w-full">
            <TabsTrigger value="requests" className="flex-1">
              新需求
              {requests.length > 0 && (
                <Badge variant="secondary" className="ml-1">{requests.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex-1">
              我的預約
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests" className="mt-4 space-y-3">
            {requests.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-400">
                  <p>目前沒有新需求</p>
                  <p className="mt-1 text-sm">有新需求時會透過 LINE 通知您</p>
                </CardContent>
              </Card>
            ) : (
              requests.map((request) => (
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
                          <p>時間：{request.preferred_date}</p>
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
                      <Button size="sm" className="flex-1 bg-pink-500 hover:bg-pink-600" asChild>
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
                          <p className="mt-2 text-sm font-medium text-pink-500">
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
