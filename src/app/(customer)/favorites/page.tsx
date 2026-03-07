"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";
import { useLiff } from "@/lib/line/liff";

interface FavoriteArtist {
  id: string;
  display_name: string;
  avatar_url: string | null;
  services: string[];
  styles: string[];
  cities: string[];
  min_price: number | null;
  max_price: number | null;
  role: string;
  studio_address: string | null;
}

interface FavoriteRow {
  id: string;
  artist_id: string;
  created_at: string;
  artists: FavoriteArtist;
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isReady, isLoggedIn } = useLiff();
  const { authFetch } = useAuthFetch();
  const [favorites, setFavorites] = useState<FavoriteRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !isLoggedIn) return;
    authFetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : []))
      .then((data: FavoriteRow[]) => setFavorites(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isReady, isLoggedIn, authFetch]);

  const handleRemove = async (artistId: string) => {
    // Optimistic remove
    setFavorites((prev) => prev.filter((f) => f.artist_id !== artistId));

    try {
      const res = await authFetch("/api/favorites", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artistId }),
      });
      if (!res.ok) {
        // Revert: re-fetch
        const refetch = await authFetch("/api/favorites");
        if (refetch.ok) setFavorites(await refetch.json());
      }
    } catch {
      // Revert: re-fetch
      const refetch = await authFetch("/api/favorites");
      if (refetch.ok) setFavorites(await refetch.json());
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

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
          <h1 className="text-lg font-semibold text-[var(--brand)]">我的收藏</h1>
          <div className="w-12" />
        </div>
      </header>

      <main className="mx-auto max-w-2xl p-4">
        {favorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
              <Heart className="h-12 w-12 text-gray-300" />
              <p className="text-gray-400">還沒有收藏的設計師</p>
              <Link
                href="/artists"
                className="mt-2 rounded-full bg-[var(--brand)] px-6 py-2 text-sm font-medium text-white hover:bg-[var(--brand-dark)]"
              >
                探索設計師
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {favorites.map((fav) => {
              const artist = fav.artists;
              if (!artist) return null;

              return (
                <div key={fav.id} className="relative">
                  <Link href={`/artists/${artist.id}`} className="block h-full">
                    <Card className="h-full transition hover:shadow-md">
                      <CardContent className="flex h-full flex-col p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-14 w-14 shrink-0">
                            <AvatarImage src={artist.avatar_url || undefined} />
                            <AvatarFallback className="bg-[var(--brand-light)] text-[var(--brand-dark)] text-lg">
                              {artist.display_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-semibold text-gray-900">
                              {artist.display_name}
                            </p>
                            <p className="mt-0.5 truncate text-xs text-gray-400">
                              {artist.studio_address || "\u00A0"}
                            </p>
                          </div>
                        </div>

                        {/* Services */}
                        <div className="mt-3 flex min-h-[28px] flex-wrap gap-1">
                          {(artist.services || []).slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-[10px]">
                              {s}
                            </Badge>
                          ))}
                          {(artist.services || []).length > 3 && (
                            <Badge variant="secondary" className="text-[10px]">
                              +{artist.services.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Price + City */}
                        <div className="mt-auto flex items-center justify-between pt-3 text-xs">
                          <span className="text-gray-400">
                            {(artist.cities || []).length > 0
                              ? (artist.cities || [])[0].split(" ")[0]
                              : ""}
                            {(artist.cities || []).length > 1 && ` +${artist.cities.length - 1}`}
                          </span>
                          <span className="font-medium text-[var(--brand)]">
                            {artist.min_price != null
                              ? `NT$${artist.min_price.toLocaleString()}`
                              : ""}
                            {artist.max_price != null &&
                              artist.max_price > (artist.min_price || 0) &&
                              `~${artist.max_price.toLocaleString()}`}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>

                  {/* Remove favorite button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemove(artist.id);
                    }}
                    className="absolute right-2 top-2 z-10 rounded-full bg-white/80 p-1.5 shadow-sm transition-colors hover:bg-red-50"
                    aria-label="取消收藏"
                  >
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
