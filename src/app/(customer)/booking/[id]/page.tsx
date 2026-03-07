"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BookingMessages } from "@/components/shared/BookingMessages";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";

interface Booking {
  id: string;
  customer_id: string;
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
    preferred_time: string | null;
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
  const { authFetch, isReady: liffReady } = useAuthFetch();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [togglingContact, setTogglingContact] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

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

  // Load customer contact visibility setting
  useEffect(() => {
    if (!liffReady) return;
    authFetch("/api/customers/me").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setShowContact(!!data.show_contact_to_artist);
      }
    }).catch(() => {});
  }, [liffReady, authFetch]);

  const handleToggleContact = async (checked: boolean) => {
    setTogglingContact(true);
    setShowContact(checked);
    try {
      await authFetch("/api/customers/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ show_contact_to_artist: checked }),
      });
    } catch {
      setShowContact(!checked); // revert on error
    } finally {
      setTogglingContact(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("確定要取消此預約嗎？")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled", cancelledBy: "客戶" }),
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

  const handleReschedule = async () => {
    if (!rescheduleDate || !rescheduleTime) return;
    setRescheduling(true);
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reschedule: { newDate: rescheduleDate, newTime: rescheduleTime, requestedBy: "客戶" },
        }),
      });
      if (res.ok) {
        setBooking((prev) =>
          prev ? { ...prev, booking_date: rescheduleDate, booking_time: rescheduleTime } : null
        );
        setShowReschedule(false);
        setRescheduleDate("");
        setRescheduleTime("");
      }
    } catch (err) {
      console.error("Reschedule failed:", err);
    } finally {
      setRescheduling(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!booking || reviewRating === 0) return;
    setReviewSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: booking.id,
          artistId: booking.artists.id,
          customerId: booking.customer_id,
          rating: reviewRating,
          comment: reviewComment || null,
        }),
      });
      if (res.ok) {
        setReviewSubmitted(true);
      }
    } catch (err) {
      console.error("Review submit error:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
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
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold text-[var(--brand)]">
            NaLi Match
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
                <AvatarFallback className="bg-[var(--brand-light)] text-[var(--brand-dark)]">
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

        {/* Contact Exchange — only shown when confirmed/completed */}
        {["confirmed", "completed"].includes(booking.status) && (
          <Card className="mb-4 border-[var(--brand)]/30 bg-[var(--brand-bg)]">
            <CardContent className="p-4">
              <h2 className="mb-3 font-semibold text-gray-700">聯繫設計師</h2>
              <p className="mb-3 text-xs text-gray-500">預約已確認，您可以透過以下方式與設計師討論細節</p>
              <div className="space-y-2">
                {booking.artists.phone && (
                  <a
                    href={`tel:${booking.artists.phone}`}
                    className="flex items-center gap-3 rounded-lg bg-white p-3 transition hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100">
                      <span className="text-lg">📞</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">電話</p>
                      <p className="font-medium text-gray-900">{booking.artists.phone}</p>
                    </div>
                  </a>
                )}
                {booking.artists.instagram_handle && (
                  <a
                    href={`https://instagram.com/${booking.artists.instagram_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-lg bg-white p-3 transition hover:bg-gray-50"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-100">
                      <span className="text-lg">📸</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Instagram</p>
                      <p className="font-medium text-gray-900">@{booking.artists.instagram_handle}</p>
                    </div>
                  </a>
                )}
                {booking.artists.studio_address && (
                  <div className="flex items-center gap-3 rounded-lg bg-white p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                      <span className="text-lg">📍</span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">工作室地址</p>
                      <p className="font-medium text-gray-900">{booking.artists.studio_address}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer contact visibility toggle */}
              <div className="mt-3 flex items-center justify-between rounded-lg bg-white p-3">
                <div>
                  <p className="text-sm font-medium text-gray-700">讓設計師看到我的電話</p>
                  <p className="text-xs text-gray-400">開啟後設計師可直接致電聯繫您</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={showContact}
                  disabled={togglingContact}
                  onClick={() => handleToggleContact(!showContact)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
                    showContact ? "bg-[var(--brand)]" : "bg-gray-200"
                  } ${togglingContact ? "opacity-50" : ""}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                      showContact ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Messages — only for confirmed/completed bookings */}
        {["confirmed", "completed"].includes(booking.status) && (
          <BookingMessages bookingId={booking.id} role="customer" fetchFn={authFetch} />
        )}

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
              {(booking.booking_time || booking.service_requests.preferred_time) && (
                <>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-gray-500">預約時間</span>
                    <span className="font-medium">{booking.booking_time || booking.service_requests.preferred_time}</span>
                  </div>
                </>
              )}
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-500">確認價格</span>
                <span className="text-lg font-bold text-[var(--brand)]">
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

        {/* Review Section - only for completed bookings */}
        {booking.status === "completed" && !reviewSubmitted && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="mb-3 font-semibold text-gray-700">評價美甲師</h2>
              <div className="mb-3 flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className={`text-2xl transition ${
                      star <= reviewRating ? "text-yellow-400" : "text-gray-300"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <Textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="分享你的體驗..."
                rows={3}
                className="mb-3"
              />
              <Button
                className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                onClick={handleSubmitReview}
                disabled={reviewRating === 0 || reviewSubmitting}
              >
                {reviewSubmitting ? "送出中..." : "送出評價"}
              </Button>
            </CardContent>
          </Card>
        )}

        {reviewSubmitted && (
          <Card className="mb-4">
            <CardContent className="p-4 text-center">
              <span className="text-2xl">★</span>
              <p className="mt-1 font-medium text-gray-700">感謝你的評價！</p>
            </CardContent>
          </Card>
        )}

        {/* Reschedule Form */}
        {showReschedule && booking.status === "confirmed" && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h2 className="mb-3 font-semibold text-gray-700">申請改期</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm text-gray-500">新日期</label>
                  <Input
                    type="date"
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-500">新時段</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  >
                    <option value="">請選擇</option>
                    <option value="上午 (10:00-12:00)">上午 (10:00-12:00)</option>
                    <option value="下午 (13:00-17:00)">下午 (13:00-17:00)</option>
                    <option value="晚上 (18:00-21:00)">晚上 (18:00-21:00)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1 bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                    onClick={handleReschedule}
                    disabled={!rescheduleDate || !rescheduleTime || rescheduling}
                  >
                    {rescheduling ? "送出中..." : "送出改期請求"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowReschedule(false)}>
                    取消
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {booking.status === "confirmed" && !showReschedule && (
            <>
              <Button
                variant="outline"
                className="w-full text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                onClick={() => setShowReschedule(true)}
              >
                申請改期
              </Button>
              <Button
                variant="outline"
                className="w-full text-red-500 hover:bg-red-50 hover:text-red-600"
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? "取消中..." : "取消預約"}
              </Button>
            </>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
