"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  confirmed: { label: "已確認", color: "bg-green-100 text-green-800" },
  completed: { label: "已完成", color: "bg-gray-100 text-gray-800" },
  cancelled: { label: "已取消", color: "bg-red-100 text-red-800" },
  no_show: { label: "未到場", color: "bg-yellow-100 text-yellow-800" },
};

export default function CustomerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, fetch all bookings (anonymous customer flow)
    // In production with LINE auth, pass customerId
    async function fetchBookings() {
      try {
        const res = await fetch("/api/bookings?all=1");
        if (res.ok) {
          setBookings(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch bookings:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold text-pink-500">
            NailMatch
          </Link>
          <h1 className="text-sm font-medium text-gray-700">我的預約</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4 space-y-3">
        {bookings.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">還沒有預約紀錄</p>
              <Button asChild className="mt-4 bg-pink-500 hover:bg-pink-600">
                <Link href="/request">立即找美甲師</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          bookings.map((booking) => {
            const status = STATUS_MAP[booking.status] || STATUS_MAP.confirmed;
            return (
              <Link key={booking.id} href={`/booking/${booking.id}`}>
                <Card className="transition hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={booking.artists?.avatar_url || undefined} />
                        <AvatarFallback className="bg-pink-100 text-pink-600">
                          {booking.artists?.display_name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-900 truncate">
                            {booking.artists?.display_name}
                          </p>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                        <p className="text-sm text-gray-500 truncate">
                          {booking.service_requests?.services?.join("、")}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-xs text-gray-400">
                          <span>{booking.booking_date || "日期待定"}</span>
                          {booking.final_price && (
                            <span className="font-medium text-pink-500">
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
      </main>
    </div>
  );
}
