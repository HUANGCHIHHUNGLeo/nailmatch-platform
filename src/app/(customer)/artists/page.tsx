"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LOCATION_GROUPS } from "@/lib/utils/constants";

interface Artist {
  id: string;
  display_name: string;
  avatar_url: string | null;
  services: string[];
  styles: string[];
  min_price: number;
  max_price: number;
  cities: string[];
  role: string;
  studio_address: string | null;
  payment_methods: string[];
  instagram_handle: string | null;
}

const CITY_FILTERS = ["全部", ...LOCATION_GROUPS.filter((g) => g.city !== "其他").map((g) => g.city)];
const ROLE_FILTERS = [
  { value: "all", label: "全部" },
  { value: "nail", label: "美甲師" },
  { value: "lash", label: "美睫師" },
];

export default function ArtistDirectoryPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState("全部");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    async function fetchArtists() {
      try {
        const res = await fetch("/api/artists");
        if (res.ok) {
          setArtists(await res.json());
        }
      } catch (err) {
        console.error("Failed to fetch artists:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      if (roleFilter !== "all" && a.role !== roleFilter) return false;
      if (cityFilter !== "全部") {
        const matchesCity = a.cities.some((c) => c.startsWith(cityFilter));
        if (!matchesCity) return false;
      }
      return true;
    });
  }, [artists, cityFilter, roleFilter]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--brand-bg)]">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold text-[var(--brand)]">
            NaLi Match
          </Link>
          <h1 className="text-sm font-medium text-gray-700">設計師總覽</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        {/* Filters */}
        <div className="mb-4 space-y-3">
          {/* Role filter */}
          <div className="flex gap-2">
            {ROLE_FILTERS.map((r) => (
              <button
                key={r.value}
                onClick={() => setRoleFilter(r.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  roleFilter === r.value
                    ? "bg-[var(--brand)] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* City filter — horizontal scroll */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {CITY_FILTERS.map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  cityFilter === city
                    ? "bg-[var(--brand-dark)] text-white"
                    : "bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <p className="mb-3 text-sm text-gray-400">
          共 {filtered.length} 位設計師
        </p>

        {/* Artist Grid */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">目前沒有符合條件的設計師</p>
              <p className="mt-1 text-xs text-gray-300">試試其他篩選條件</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}`}>
                <Card className="transition hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-14 w-14 shrink-0">
                        <AvatarImage src={artist.avatar_url || undefined} />
                        <AvatarFallback className="bg-[var(--brand-light)] text-[var(--brand-dark)] text-lg">
                          {artist.display_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate font-semibold text-gray-900">
                            {artist.display_name}
                          </p>
                          <Badge
                            className={`shrink-0 text-[10px] ${
                              artist.role === "lash"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-[var(--brand-light)] text-[var(--brand-darker)]"
                            }`}
                          >
                            {artist.role === "lash" ? "美睫" : "美甲"}
                          </Badge>
                        </div>

                        {artist.studio_address && (
                          <p className="mt-0.5 truncate text-xs text-gray-400">
                            {artist.studio_address}
                          </p>
                        )}

                        {/* Services */}
                        <div className="mt-2 flex flex-wrap gap-1">
                          {artist.services.slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-[10px]">
                              {s}
                            </Badge>
                          ))}
                          {artist.services.length > 3 && (
                            <Badge variant="secondary" className="text-[10px]">
                              +{artist.services.length - 3}
                            </Badge>
                          )}
                        </div>

                        {/* Price + City */}
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-gray-400">
                            {artist.cities.length > 0
                              ? artist.cities[0].split(" ")[0]
                              : ""}
                            {artist.cities.length > 1 && ` +${artist.cities.length - 1}`}
                          </span>
                          <span className="font-medium text-[var(--brand)]">
                            NT${artist.min_price.toLocaleString()}
                            {artist.max_price > artist.min_price && `~${artist.max_price.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
