"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Booking {
  id: string;
  booking_date: string | null;
  booking_time: string | null;
  final_price: number | null;
  status: string;
  created_at: string;
  service_requests: {
    services: string[];
    locations: string[];
    budget_range: string;
  };
  customers: {
    display_name: string;
  };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: "已確認", color: "bg-green-100 text-green-800" },
  completed: { label: "已完成", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
  no_show: { label: "未到場", color: "bg-yellow-100 text-yellow-800" },
};

export default function ArtistBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [artistId, setArtistId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Get current artist
        const meRes = await fetch("/api/artists/me");
        if (!meRes.ok) return;
        const me = await meRes.json();
        setArtistId(me.id);

        // Fetch bookings
        const res = await fetch(`/api/bookings?artistId=${me.id}`);
        if (res.ok) {
          setBookings(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  const confirmed = bookings.filter((b) => b.status === "confirmed");
  const completed = bookings.filter((b) => b.status === "completed");
  const cancelled = bookings.filter((b) => ["cancelled", "no_show"].includes(b.status));

  const renderBookingCard = (booking: Booking) => {
    const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP.confirmed;
    return (
      <Card key={booking.id}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">
                {booking.customers?.display_name || "顧客"}
              </p>
              <div className="mt-1 flex flex-wrap gap-1">
                {booking.service_requests?.services.map((s) => (
                  <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                ))}
              </div>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>地點：{booking.service_requests?.locations.join("、")}</p>
                {booking.booking_date && <p>日期：{booking.booking_date}</p>}
                {booking.booking_time && <p>時間：{booking.booking_time}</p>}
                {booking.final_price && (
                  <p className="font-medium text-pink-500">
                    NT${booking.final_price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>

          {booking.status === "confirmed" && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => handleUpdateStatus(booking.id, "completed")}
              >
                標記完成
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-500"
                onClick={() => handleUpdateStatus(booking.id, "cancelled")}
              >
                取消
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/artist/dashboard" className="text-sm text-gray-500">
            ← 返回
          </Link>
          <span className="text-lg font-semibold text-pink-500">預約管理</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        <Tabs defaultValue="upcoming">
          <TabsList className="w-full">
            <TabsTrigger value="upcoming" className="flex-1">
              待服務
              {confirmed.length > 0 && (
                <Badge variant="secondary" className="ml-1">{confirmed.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex-1">已完成</TabsTrigger>
            <TabsTrigger value="cancelled" className="flex-1">已取消</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-4 space-y-3">
            {confirmed.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-400">
                  <p>目前沒有待服務的預約</p>
                </CardContent>
              </Card>
            ) : (
              confirmed.map(renderBookingCard)
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4 space-y-3">
            {completed.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-400">
                  <p>尚無已完成的預約</p>
                </CardContent>
              </Card>
            ) : (
              completed.map(renderBookingCard)
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="mt-4 space-y-3">
            {cancelled.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-gray-400">
                  <p>沒有已取消的預約</p>
                </CardContent>
              </Card>
            ) : (
              cancelled.map(renderBookingCard)
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
