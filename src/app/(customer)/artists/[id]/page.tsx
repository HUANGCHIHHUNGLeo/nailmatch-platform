"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, MapPin, Star, Scissors, Palette, CreditCard, Instagram, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PortfolioWork {
  id: string;
  image_url: string;
  title: string | null;
  style: string | null;
  price_hint: number | null;
}

interface Artist {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  gender: string | null;
  services: string[];
  styles: string[];
  cities: string[];
  service_location_type: string | null;
  studio_address: string | null;
  min_price: number | null;
  max_price: number | null;
  instagram_handle: string | null;
  line_id: string | null;
  payment_methods: string[] | null;
  portfolio: PortfolioWork[];
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
  const router = useRouter();
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
        <div className="text-center">
          <p className="mb-4 text-gray-500">找不到設計師</p>
          <Button asChild variant="outline">
            <Link href="/">回首頁</Link>
          </Button>
        </div>
      </div>
    );
  }

  const locationType =
    artist.service_location_type === "store"
      ? "工作室"
      : artist.service_location_type === "home_visit"
      ? "到府服務"
      : artist.service_location_type === "both"
      ? "工作室 / 到府服務"
      : null;

  const priceRange =
    artist.min_price && artist.max_price
      ? `NT$${artist.min_price.toLocaleString()} ~ NT$${artist.max_price.toLocaleString()}`
      : artist.min_price
      ? `NT$${artist.min_price.toLocaleString()} 起`
      : artist.max_price
      ? `最高 NT$${artist.max_price.toLocaleString()}`
      : null;

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" />
            返回
          </button>
          <Link href="/" className="text-lg font-semibold text-[var(--brand)]">
            NaLi Match
          </Link>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4 space-y-4">
        {/* Profile Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={artist.avatar_url || undefined} />
                <AvatarFallback className="bg-[var(--brand-light)] text-2xl text-[var(--brand-dark)]">
                  {artist.display_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900">{artist.display_name}</h1>
                {reviewData && reviewData.totalReviews > 0 && (
                  <div className="mt-1 flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{reviewData.averageRating.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">({reviewData.totalReviews} 則評價)</span>
                  </div>
                )}
                {priceRange && (
                  <p className="mt-1 text-sm font-medium text-[var(--brand)]">{priceRange}</p>
                )}
              </div>
            </div>

            {artist.bio && (
              <p className="mt-4 text-sm leading-relaxed text-gray-600">{artist.bio}</p>
            )}

            {/* Social Links */}
            <div className="mt-4 flex flex-wrap gap-2">
              {artist.instagram_handle && (
                <a
                  href={`https://instagram.com/${artist.instagram_handle.replace("@", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-3 py-1 text-xs font-medium text-white"
                >
                  <Instagram className="h-3 w-3" />
                  @{artist.instagram_handle.replace("@", "")}
                </a>
              )}
              {artist.line_id && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-500 px-3 py-1 text-xs font-medium text-white">
                  <MessageCircle className="h-3 w-3" />
                  LINE 聯繫
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
              <MapPin className="h-4 w-4 text-[var(--brand)]" />
              服務地區
            </h2>
            <div className="flex flex-wrap gap-2">
              {artist.cities.map((city) => (
                <Badge key={city} variant="secondary">{city}</Badge>
              ))}
            </div>
            {locationType && (
              <p className="mt-2 text-sm text-gray-500">{locationType}</p>
            )}
            {artist.studio_address && (
              <p className="mt-1 text-sm text-gray-500">{artist.studio_address}</p>
            )}
          </CardContent>
        </Card>

        {/* Services */}
        <Card>
          <CardContent className="p-4">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
              <Scissors className="h-4 w-4 text-[var(--brand)]" />
              服務項目
            </h2>
            <div className="flex flex-wrap gap-2">
              {artist.services.map((service) => (
                <Badge key={service} className="bg-[var(--brand-light)] text-[var(--brand-dark)]">
                  {service}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Styles */}
        {artist.styles.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <Palette className="h-4 w-4 text-[var(--brand)]" />
                擅長風格
              </h2>
              <div className="flex flex-wrap gap-2">
                {artist.styles.map((style) => (
                  <Badge key={style} variant="outline">{style}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Methods */}
        {artist.payment_methods && artist.payment_methods.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-900">
                <CreditCard className="h-4 w-4 text-[var(--brand)]" />
                付款方式
              </h2>
              <div className="flex flex-wrap gap-2">
                {artist.payment_methods.map((method) => (
                  <Badge key={method} variant="secondary">{method}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Portfolio */}
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            作品集 ({artist.portfolio.length})
          </h2>
          {artist.portfolio.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-400">
                <p>尚無作品</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {artist.portfolio.map((work) => (
                <Card key={work.id} className="overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={work.image_url}
                      alt={work.title || "作品"}
                      className="h-full w-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  {(work.title || work.style || work.price_hint) && (
                    <CardContent className="p-3">
                      {work.title && <p className="text-sm font-medium">{work.title}</p>}
                      <div className="mt-1 flex items-center justify-between">
                        {work.style && (
                          <Badge variant="secondary" className="text-xs">{work.style}</Badge>
                        )}
                        {work.price_hint && (
                          <span className="text-xs text-[var(--brand)]">
                            NT${work.price_hint.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>

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
        <div className="pb-8">
          <Button
            asChild
            className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)] h-12 text-base"
          >
            <Link href={`/request?artistId=${id}`}>向這位設計師預約</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
