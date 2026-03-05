"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star } from "lucide-react";

interface Artist {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  services: string[];
  styles: string[];
  cities: string[];
  min_price: number | null;
  max_price: number | null;
  instagram_handle: string | null;
  studio_address: string | null;
  portfolio_works: {
    id: string;
    image_url: string;
    title: string | null;
    style: string | null;
  }[];
}

interface ReviewData {
  averageRating: number;
  totalReviews: number;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    created_at: string;
  }[];
}

export default function ArtistPublicPage() {
  const { id } = useParams<{ id: string }>();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [artistRes, reviewRes] = await Promise.all([
          fetch(`/api/artists/${id}`),
          fetch(`/api/reviews?artistId=${id}`),
        ]);
        if (artistRes.ok) setArtist(await artistRes.json());
        if (reviewRes.ok) setReviewData(await reviewRes.json());
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-gray-500">找不到此美甲師</p>
          <Button asChild variant="outline">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold text-pink-500">
            NaLi Match
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6 text-center">
            <Avatar className="mx-auto h-20 w-20">
              <AvatarImage src={artist.avatar_url || undefined} />
              <AvatarFallback className="bg-pink-100 text-2xl text-pink-600">
                {artist.display_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h1 className="mt-3 text-xl font-bold text-gray-900">
              {artist.display_name}
            </h1>
            {artist.studio_address && (
              <p className="mt-1 flex items-center justify-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3 w-3" />
                {artist.studio_address}
              </p>
            )}
            {reviewData && reviewData.totalReviews > 0 && (
              <div className="mt-2 flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{reviewData.averageRating.toFixed(1)}</span>
                <span className="text-sm text-gray-400">({reviewData.totalReviews} 則評價)</span>
              </div>
            )}
            {artist.instagram_handle && (
              <p className="mt-1 text-sm text-gray-400">@{artist.instagram_handle}</p>
            )}
          </CardContent>
        </Card>

        {/* Bio */}
        {artist.bio && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-2 font-semibold text-gray-700">關於我</h2>
              <p className="text-sm text-gray-600">{artist.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Services & Styles */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div>
              <h2 className="mb-2 font-semibold text-gray-700">服務項目</h2>
              <div className="flex flex-wrap gap-1">
                {artist.services.map((s) => (
                  <Badge key={s} variant="secondary">{s}</Badge>
                ))}
              </div>
            </div>
            {artist.styles.length > 0 && (
              <div>
                <h2 className="mb-2 font-semibold text-gray-700">擅長風格</h2>
                <div className="flex flex-wrap gap-1">
                  {artist.styles.map((s) => (
                    <Badge key={s} variant="outline">{s}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div>
              <h2 className="mb-2 font-semibold text-gray-700">服務地區</h2>
              <div className="flex flex-wrap gap-1">
                {artist.cities.map((c) => (
                  <Badge key={c} variant="secondary">{c}</Badge>
                ))}
              </div>
            </div>
            {artist.min_price && artist.max_price && (
              <div>
                <h2 className="mb-1 font-semibold text-gray-700">價格範圍</h2>
                <p className="text-sm text-pink-500 font-medium">
                  NT${artist.min_price.toLocaleString()} — NT${artist.max_price.toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio */}
        {artist.portfolio_works.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 font-semibold text-gray-700">作品集</h2>
              <div className="grid grid-cols-3 gap-2">
                {artist.portfolio_works.map((work) => (
                  <div key={work.id} className="relative aspect-square overflow-hidden rounded-lg">
                    <img
                      src={work.image_url}
                      alt={work.title || "作品"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        {reviewData && reviewData.reviews.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 font-semibold text-gray-700">顧客評價</h2>
              <div className="space-y-3">
                {reviewData.reviews.map((review) => (
                  <div key={review.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-xs text-gray-400">
                        {new Date(review.created_at).toLocaleDateString("zh-TW")}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <Button asChild className="w-full bg-pink-500 hover:bg-pink-600">
          <Link href="/request">向這位美甲師預約</Link>
        </Button>
      </main>
    </div>
  );
}
