"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";
import { useAuthSWR } from "@/lib/line/use-auth-swr";
import { BookingMessages } from "@/components/shared/BookingMessages";

interface ArtistMe {
  id: string;
}

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
    customer_phone: string | null;
  };
  customers: {
    display_name: string;
    show_contact_to_artist?: boolean;
  };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: "已確認", color: "bg-green-100 text-green-800" },
  completed: { label: "已完成", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
  no_show: { label: "未到場", color: "bg-yellow-100 text-yellow-800" },
};

export default function ArtistBookingsPage() {
  const { authFetch } = useAuthFetch();
  const { data: me } = useAuthSWR<ArtistMe>("/api/artists/me");
  const { data: bookings, mutate } = useAuthSWR<Booking[]>(
    me?.id ? `/api/bookings?artistId=${me.id}` : null
  );
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const loading = !me;
  const bookingList = bookings || [];

  const handleUpdateStatus = async (bookingId: string, status: string) => {
    setUpdatingId(bookingId);
    try {
      const res = await authFetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, cancelledBy: status === "cancelled" ? "設計師" : undefined }),
      });
      if (res.ok) {
        // Optimistic update + revalidate
        mutate(
          bookingList.map((b) => (b.id === bookingId ? { ...b, status } : b)),
          { revalidate: true }
        );
      }
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReschedule = async (bookingId: string) => {
    if (!rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    try {
      const res = await authFetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reschedule: { newDate: rescheduleDate, newTime: rescheduleTime, requestedBy: "設計師" },
        }),
      });
      if (res.ok) {
        mutate(
          bookingList.map((b) =>
            b.id === bookingId ? { ...b, booking_date: rescheduleDate, booking_time: rescheduleTime } : b
          ),
          { revalidate: true }
        );
        setRescheduleId(null);
        setRescheduleDate("");
        setRescheduleTime("");
      }
    } catch (err) {
      console.error("Reschedule failed:", err);
    } finally {
      setRescheduling(false);
    }
  };

  const confirmed = bookingList.filter((b) => b.status === "confirmed");
  const completed = bookingList.filter((b) => b.status === "completed");
  const cancelled = bookingList.filter((b) => ["cancelled", "no_show"].includes(b.status));

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
                  <p className="font-medium text-[var(--brand)]">
                    NT${booking.final_price.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
            <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
          </div>

          {/* Customer Contact — only when customer has opted in */}
          {booking.status === "confirmed" && booking.customers?.show_contact_to_artist && booking.service_requests?.customer_phone && (
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 p-3">
              <p className="mb-1 text-xs font-medium text-blue-700">顧客聯繫方式</p>
              <a
                href={`tel:${booking.service_requests.customer_phone}`}
                className="text-sm font-medium text-blue-900 hover:underline"
              >
                📞 {booking.service_requests.customer_phone}
              </a>
            </div>
          )}

          {/* Messages */}
          {booking.status === "confirmed" && (
            <div className="mt-3">
              <BookingMessages bookingId={booking.id} role="artist" fetchFn={authFetch} />
            </div>
          )}

          {booking.status === "confirmed" && rescheduleId === booking.id && (
            <div className="mt-3 space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-sm font-medium text-amber-800">申請改期</p>
              <input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
              />
              <select
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="w-full rounded-md border px-3 py-1.5 text-sm"
              >
                <option value="">選擇時段</option>
                <option value="上午 (10:00-12:00)">上午 (10:00-12:00)</option>
                <option value="下午 (13:00-17:00)">下午 (13:00-17:00)</option>
                <option value="晚上 (18:00-21:00)">晚上 (18:00-21:00)</option>
              </select>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 bg-amber-500 hover:bg-amber-600"
                  onClick={() => handleReschedule(booking.id)}
                  disabled={!rescheduleDate || !rescheduleTime || rescheduling}
                >
                  {rescheduling ? "送出中..." : "確認改期"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setRescheduleId(null)}>
                  取消
                </Button>
              </div>
            </div>
          )}

          {booking.status === "confirmed" && rescheduleId !== booking.id && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-green-500 hover:bg-green-600"
                onClick={() => handleUpdateStatus(booking.id, "completed")}
                disabled={updatingId === booking.id}
              >
                標記完成
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-amber-600"
                onClick={() => setRescheduleId(booking.id)}
              >
                改期
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-red-500"
                onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                disabled={updatingId === booking.id}
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
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/artist/dashboard" className="text-sm text-gray-500">
            ← 返回
          </Link>
          <span className="text-lg font-semibold text-[var(--brand)]">預約管理</span>
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
