"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

interface Booking {
  id: string;
  booking_date: string | null;
  booking_time: string | null;
  final_price: number | null;
  status: string;
  created_at: string;
  artists: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    studio_address: string | null;
    phone: string | null;
    instagram_handle: string | null;
    styles: string[];
  };
  service_requests: {
    services: string[];
    locations: string[];
    budget_range: string;
    preferred_date: string;
    preferred_styles: string[];
  };
  artist_responses: {
    quoted_price: number;
    message: string | null;
    available_time: string;
  };
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: "已確認", color: "bg-green-100 text-green-800" },
  completed: { label: "已完成", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
  no_show: { label: "未到場", color: "bg-yellow-100 text-yellow-800" },
};

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const res = await fetch(`/api/bookings/${id}`);
        if (res.ok) {
          setBooking(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch booking:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBooking();
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("確定要取消此預約嗎？")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        setBooking((prev) => prev ? { ...prev, status: "cancelled" } : null);
      }
    } catch (err) {
      console.error("Cancel failed:", err);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-500">找不到此預約</p>
          <Button asChild variant="outline">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[booking.status] || STATUS_MAP.confirmed;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold text-pink-500">
            NailMatch
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {/* Booking Status */}
        <Card className="mb-4">
          <CardContent className="p-6 text-center">
            {booking.status === "confirmed" && (
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <span className="text-3xl">✓</span>
              </div>
            )}
            <h1 className="text-xl font-bold text-gray-900">
              {booking.status === "confirmed" ? "預約成功！" : "預約詳情"}
            </h1>
            <Badge className={`mt-2 ${statusInfo.color}`}>{statusInfo.label}</Badge>
          </CardContent>
        </Card>

        {/* Artist Info */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="mb-3 font-semibold text-gray-700">美甲師資訊</h2>
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarImage src={booking.artists.avatar_url || undefined} />
                <AvatarFallback className="bg-pink-100 text-pink-600">
                  {booking.artists.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-gray-900">{booking.artists.display_name}</p>
                {booking.artists.studio_address && (
                  <p className="text-sm text-gray-500">{booking.artists.studio_address}</p>
                )}
                {booking.artists.instagram_handle && (
                  <p className="text-xs text-gray-400">@{booking.artists.instagram_handle}</p>
                )}
              </div>
            </div>
            {booking.artists.styles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {booking.artists.styles.map((style) => (
                  <Badge key={style} variant="secondary" className="text-xs">{style}</Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Details */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h2 className="mb-3 font-semibold text-gray-700">預約詳情</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">服務項目</span>
                <span className="font-medium">{booking.service_requests.services.join("、")}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">地點</span>
                <span className="font-medium">{booking.service_requests.locations.join("、")}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">預約日期</span>
                <span className="font-medium">{booking.booking_date || booking.service_requests.preferred_date}</span>
              </div>
              {booking.booking_time && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">預約時間</span>
                    <span className="font-medium">{booking.booking_time}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">確認價格</span>
                <span className="text-lg font-bold text-pink-500">
                  NT${(booking.final_price || booking.artist_responses.quoted_price).toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Artist Message */}
        {booking.artist_responses.message && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="mb-2 font-semibold text-gray-700">美甲師留言</h2>
              <p className="text-sm text-gray-600 italic">
                &ldquo;{booking.artist_responses.message}&rdquo;
              </p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {booking.status === "confirmed" && (
            <Button
              variant="outline"
              className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "取消中..." : "取消預約"}
            </Button>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
