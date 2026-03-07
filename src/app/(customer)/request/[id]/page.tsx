"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RequestStatusDashboard } from "@/components/shared/RequestStatusDashboard";
import { QuoteCard } from "@/components/shared/QuoteCard";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, Home, RefreshCw } from "lucide-react";

interface ArtistResponse {
  id: string;
  quoted_price: number;
  message: string | null;
  available_time: string;
  status: string;
  artists: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    studio_address: string | null;
    instagram_handle: string | null;
    styles: string[];
    portfolio_works: { image_url: string; title: string | null; style: string | null }[];
  };
}

interface ServiceRequest {
  id: string;
  customer_id: string;
  locations: string[];
  services: string[];
  budget_range: string;
  preferred_date: string;
  preferred_time: string | null;
  status: string;
  notified_count: number;
  viewed_count: number;
  has_line: boolean;
  responses: ArtistResponse[];
}

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState<{ name: string; images: { image_url: string; title: string | null }[] }>({ name: "", images: [] });

  const fetchRequest = useCallback(async () => {
    try {
      const res = await fetch(`/api/requests/${id}`);
      if (res.ok) {
        const data = await res.json();
        setRequest(data);
      }
    } catch (err) {
      console.error("Failed to fetch request:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [fetchRequest]);

  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showLinePrompt, setShowLinePrompt] = useState(false);

  const handleBook = async (quoteId: string) => {
    if (!request || booking) return;

    // Gate: require LINE login to book
    if (!request.has_line) {
      setShowLinePrompt(true);
      return;
    }

    setBooking(true);
    setBookingError(null);

    try {
      const response = request.responses.find((r) => r.id === quoteId);
      if (!response) {
        setBookingError("找不到此報價，請重新整理頁面");
        return;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          responseId: quoteId,
          customerId: request.customer_id,
          artistId: response.artists.id,
          bookingDate: request.preferred_date,
          bookingTime: response.available_time || request.preferred_time || null,
          finalPrice: response.quoted_price,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/booking/${data.id}`);
      } else {
        const errData = await res.json().catch(() => null);
        setBookingError(errData?.error || "預約失敗，請稍後再試");
      }
    } catch (err) {
      console.error("Booking failed:", err);
      setBookingError("網路錯誤，請稍後再試");
    } finally {
      setBooking(false);
    }
  };

  const handleViewPortfolio = (artistId: string) => {
    const response = request?.responses.find((r) => r.artists.id === artistId);
    if (response) {
      setSelectedPortfolio({
        name: response.artists.display_name,
        images: response.artists.portfolio_works,
      });
      setPortfolioOpen(true);
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm("確定要取消此需求配對嗎？")) return;
    setCancelling(true);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (res.ok) {
        setRequest((prev) => prev ? { ...prev, status: "cancelled" } : null);
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
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
          <p className="text-gray-500">載入中...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-500">找不到此需求</p>
          <Button asChild variant="outline">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
            >
              <ChevronLeft className="h-4 w-4" />
              上一頁
            </button>
            <div className="h-4 w-px bg-gray-200" />
            <Link href="/" className="text-lg font-semibold text-[var(--brand)]">
              NaLi Match
            </Link>
          </div>
          <div>
            <Button variant="ghost" size="sm" asChild className="text-gray-500 hover:text-[var(--brand)]">
              <Link href="/">
                <Home className="h-4 w-4 mr-1" />
                回主頁
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {/* Status Dashboard */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">需求狀態</h2>
          {request && ["pending", "matching"].includes(request.status) && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleCancelRequest}
              disabled={cancelling}
            >
              取消配對
            </Button>
          )}
        </div>

        <RequestStatusDashboard
          status={request.status as "pending" | "matching" | "matched" | "confirmed" | "completed" | "cancelled"}
          notifiedCount={request.notified_count}
          viewedCount={request.viewed_count}
          quoteCount={request.responses.length}
          services={request.services}
          budget={request.budget_range}
          location={request.locations.join("、")}
          date={`${request.preferred_date} ${request.preferred_time || ""}`}
        />

        {/* LINE login prompt for anonymous customers */}
        {!request.has_line && ["pending", "matching"].includes(request.status) && (
          <Card className="mt-4 border-[#06C755]/30 bg-[#06C755]/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#06C755]">
                  <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">透過 LINE 接收即時報價通知</p>
                  <p className="text-xs text-gray-500">目前您尚未綁定 LINE，設計師報價時將無法通知您。請加入 LINE 好友以接收報價。</p>
                </div>
              </div>
              <a
                href={`https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || ""}/my`}
                className="mt-3 flex w-full items-center justify-center rounded-lg bg-[#06C755] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#05a647]"
              >
                加入 LINE 好友並綁定帳號
              </a>
            </CardContent>
          </Card>
        )}

        {/* Booking Error */}
        {bookingError && (
          <Card className="mt-4 border-red-200 bg-red-50">
            <CardContent className="p-3">
              <p className="text-sm font-medium text-red-700">{bookingError}</p>
            </CardContent>
          </Card>
        )}

        {/* Quotes Section */}
        <div className="mt-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              收到的報價 ({request.responses.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                setRefreshing(true);
                await fetchRequest();
                setRefreshing(false);
              }}
              disabled={refreshing}
              className="text-gray-500"
            >
              <RefreshCw className={`mr-1 h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "更新中" : "重新整理"}
            </Button>
          </div>

          {request.responses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--brand-light)]/50">
                  <span className="text-2xl">💅</span>
                </div>
                <p className="font-medium text-gray-700">等待設計師報價中</p>
                <p className="mt-1 text-sm text-gray-500">
                  已通知 {request.notified_count} 位設計師，收到報價時會透過 LINE 通知你
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {request.responses.map((response) => (
                <QuoteCard
                  key={response.id}
                  artist={{
                    id: response.artists.id,
                    displayName: response.artists.display_name,
                    avatarUrl: response.artists.avatar_url || undefined,
                    studioAddress: response.artists.studio_address || undefined,
                    instagramHandle: response.artists.instagram_handle || undefined,
                    styles: response.artists.styles,
                  }}
                  quote={{
                    id: response.id,
                    quotedPrice: response.quoted_price,
                    message: response.message || undefined,
                    availableTime: response.available_time,
                  }}
                  portfolioImages={response.artists.portfolio_works.map((pw) => pw.image_url)}
                  onViewPortfolio={handleViewPortfolio}
                  onBook={handleBook}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* LINE Login Prompt Dialog */}
      <Dialog open={showLinePrompt} onOpenChange={setShowLinePrompt}>
        <DialogContent className="max-w-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#06C755]">
              <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900">請先登入 LINE</h3>
            <p className="mt-2 text-sm text-gray-500">
              為了確認您的身份並讓設計師能與您聯繫，請先透過 LINE 登入後再進行預約。
            </p>
            <a
              href={`https://liff.line.me/${process.env.NEXT_PUBLIC_LIFF_ID || ""}/my`}
              className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#06C755] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#05a647]"
            >
              用 LINE 登入
            </a>
            <button
              onClick={() => setShowLinePrompt(false)}
              className="mt-2 w-full py-2 text-sm text-gray-400 hover:text-gray-600"
            >
              稍後再說
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Portfolio Dialog */}
      <Dialog open={portfolioOpen} onOpenChange={setPortfolioOpen}>
        <DialogContent className="max-h-[80vh] max-w-lg overflow-y-auto">
          <h3 className="mb-4 text-lg font-semibold">{selectedPortfolio.name} 的作品集</h3>
          {selectedPortfolio.images.length === 0 ? (
            <p className="text-center text-gray-500">尚無作品</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {selectedPortfolio.images.map((img, i) => (
                <div key={i} className="aspect-square overflow-hidden rounded-lg">
                  <img
                    src={img.image_url}
                    alt={img.title || `作品 ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
