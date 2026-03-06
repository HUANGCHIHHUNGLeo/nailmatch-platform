"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";
import { useLiff } from "@/lib/line/liff";

interface ServiceRequest {
  id: string;
  customer_id: string;
  locations: string[];
  services: string[];
  customer_gender: string;
  nail_length: string;
  preferred_styles: string[];
  preferred_date: string;
  preferred_time: string | null;
  preferred_date_custom: string | null;
  artist_gender_pref: string;
  budget_range: string;
  needs_removal: string;
  reference_images: string[];
  additional_notes: string;
  status: string;
  created_at: string;
}

export default function ArtistRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { isReady, isLoggedIn } = useLiff();
  const { authFetch } = useAuthFetch();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [artistId, setArtistId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Quote form state
  const [quotedPrice, setQuotedPrice] = useState("");
  const [message, setMessage] = useState("");
  const [availableTime, setAvailableTime] = useState("");

  useEffect(() => {
    if (!isReady || !isLoggedIn) return;
    async function fetchData() {
      try {
        const res = await authFetch(`/api/requests/${id}`);
        if (res.ok) {
          const data = await res.json();
          setRequest(data);
        }

        await authFetch(`/api/requests/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ increment_viewed: true }),
        });

        const meRes = await authFetch("/api/artists/me");
        if (meRes.ok) {
          const me = await meRes.json();
          setArtistId(me.id);
        }
      } catch (err) {
        console.error("Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, isReady, isLoggedIn, authFetch]);

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artistId || !quotedPrice) return;
    setSubmitting(true);

    try {
      const res = await authFetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: id,
          artistId,
          quotedPrice: parseInt(quotedPrice),
          message: message || null,
          availableTime: availableTime || null,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error("Quote submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-500">找不到此需求</p>
          <Button asChild variant="outline">
            <Link href="/artist/dashboard">回到主頁</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <span className="text-3xl">✓</span>
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">報價已送出！</h2>
          <p className="mb-6 text-gray-500">顧客會收到通知，請等待回覆</p>
          <Button asChild className="bg-[var(--brand)] hover:bg-[var(--brand-dark)]">
            <Link href="/artist/dashboard">回到主頁</Link>
          </Button>
        </div>
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
          <span className="text-lg font-semibold text-[var(--brand)]">需求詳情</span>
          <div className="w-10" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {/* Services & Budget */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {request.services.map((service) => (
                <Badge key={service} className="bg-[var(--brand-light)] text-[var(--brand-darker)]">{service}</Badge>
              ))}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">預算</span>
                <span className="font-semibold text-[var(--brand)]">{request.budget_range}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">地點</span>
                <span className="font-medium">{request.locations.join("、")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">希望時間</span>
                <span className="font-medium">
                  {request.preferred_date} {request.preferred_time || ""}
                  {request.preferred_date_custom && ` (${request.preferred_date_custom})`}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Details */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="mb-3 font-semibold text-gray-700">顧客需求</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">性別</span>
                <span>{request.customer_gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">甲長</span>
                <span>{request.nail_length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">偏好風格</span>
                <span>{request.preferred_styles.join("、")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">是否需要卸甲</span>
                <span>{request.needs_removal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">美甲師性別偏好</span>
                <span>{request.artist_gender_pref}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reference Images */}
        {request.reference_images.length > 0 && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="mb-3 font-semibold text-gray-700">參考圖片</h3>
              <div className="grid grid-cols-3 gap-2">
                {request.reference_images.map((img, i) => (
                  <div key={i} className="aspect-square overflow-hidden rounded-lg">
                    <img src={img} alt={`參考 ${i + 1}`} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        {request.additional_notes && (
          <Card className="mb-4">
            <CardContent className="p-4">
              <h3 className="mb-2 font-semibold text-gray-700">備註</h3>
              <p className="text-sm text-gray-600">{request.additional_notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Quote Form */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">送出報價</h3>
            <form onSubmit={handleSubmitQuote} className="space-y-4">
              <div>
                <Label htmlFor="price">報價金額 (NT$) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="例：1200"
                  value={quotedPrice}
                  onChange={(e) => setQuotedPrice(e.target.value)}
                  required
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="time">可服務時段</Label>
                <Input
                  id="time"
                  placeholder="例：3/5 下午 2:00"
                  value={availableTime}
                  onChange={(e) => setAvailableTime(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="message">給顧客的話</Label>
                <Textarea
                  id="message"
                  placeholder="介紹自己、說明報價內容..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]"
                disabled={submitting || !quotedPrice}
              >
                {submitting ? "送出中..." : "送出報價"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
