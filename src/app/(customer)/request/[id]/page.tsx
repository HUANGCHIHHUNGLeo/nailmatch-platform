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

  const handleBook = async (quoteId: string) => {
    if (!request || booking) return;
    setBooking(true);

    const response = request.responses.find((r) => r.id === quoteId);
    if (!response) return;

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: request.id,
          responseId: quoteId,
          customerId: request.customer_id,
          artistId: response.artists.id,
          bookingDate: request.preferred_date,
          finalPrice: response.quoted_price,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        router.push(`/booking/${data.id}`);
      }
    } catch (err) {
      console.error("Booking failed:", err);
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
