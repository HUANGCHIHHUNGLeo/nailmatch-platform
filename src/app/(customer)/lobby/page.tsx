"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LOCATION_GROUPS,
  NAIL_SERVICES,
  LASH_SERVICES,
  REQUEST_STATUS,
} from "@/lib/utils/constants";
import { MapPin, Wallet, CalendarDays, MessageSquareQuote } from "lucide-react";

interface LobbyRequest {
  id: string;
  services: string[];
  locations: string[];
  budget_range: string;
  preferred_date: string;
  preferred_time: string | null;
  preferred_styles: string[];
  nail_length: string | null;
  status: string;
  created_at: string;
  response_count: number;
}

const NAIL_LABELS = new Set<string>(NAIL_SERVICES.map((s) => s.label));
const LASH_LABELS = new Set<string>(LASH_SERVICES.map((s) => s.label));

const SERVICE_FILTERS = [
  { value: "all", label: "全部" },
  { value: "nail", label: "美甲" },
  { value: "lash", label: "美睫" },
];

const CITY_FILTERS = [
  "全部",
  ...LOCATION_GROUPS.filter((g) => g.enabled !== false && g.city !== "其他").map((g) => g.city),
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "剛剛";
  if (mins < 60) return `${mins} 分鐘前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} 小時前`;
  return `${Math.floor(hours / 24)} 天前`;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("zh-TW", {
      month: "numeric",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const PAGE_LIMIT = 20;

export default function LobbyPage() {
  const [requests, setRequests] = useState<LobbyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [serviceFilter, setServiceFilter] = useState("all");
  const [cityFilter, setCityFilter] = useState("全部");

  useEffect(() => {
    async function fetchLobby() {
      try {
        const res = await fetch(`/api/lobby?limit=${PAGE_LIMIT}`);
        if (res.ok) {
          const result = await res.json();
          setRequests(result.data || []);
          setHasMore(result.hasMore || false);
          setTotal(result.total || 0);
        }
      } catch (err) {
        console.error("Failed to fetch lobby:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLobby();
  }, []);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await fetch(`/api/lobby?page=${nextPage}&limit=${PAGE_LIMIT}`);
      if (res.ok) {
        const result = await res.json();
        setRequests((prev) => [...prev, ...(result.data || [])]);
        setHasMore(result.hasMore || false);
        setPage(nextPage);
      }
    } catch (err) {
      console.error("Failed to load more:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      // Service type filter
      if (serviceFilter === "nail") {
        if (!r.services.some((s) => NAIL_LABELS.has(s))) return false;
      } else if (serviceFilter === "lash") {
        if (!r.services.some((s) => LASH_LABELS.has(s))) return false;
      }
      // City filter
      if (cityFilter !== "全部") {
        if (!r.locations.some((loc) => loc.startsWith(cityFilter))) return false;
      }
      return true;
    });
  }, [requests, serviceFilter, cityFilter]);

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
          <h1 className="text-sm font-medium text-gray-700">配對大廳</h1>
          <div className="w-16" />
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-4">
        {/* Filters */}
        <div className="mb-4 space-y-3">
          {/* Service type filter */}
          <div className="flex gap-2">
            {SERVICE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setServiceFilter(f.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  serviceFilter === f.value
                    ? "bg-[var(--brand)] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* City filter */}
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
          共 {filtered.length} 筆需求
          {total > requests.length && ` (全部 ${total} 筆)`}
        </p>

        {/* Request Grid */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-400">目前沒有符合條件的需求</p>
              <p className="mt-1 text-xs text-gray-300">試試其他篩選條件，或稍後再來看看</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {filtered.map((req) => {
              const statusInfo = REQUEST_STATUS[req.status as keyof typeof REQUEST_STATUS];
              return (
                <Link key={req.id} href={`/request/${req.id}`} className="block">
                  <Card className="h-full transition hover:shadow-md">
                    <CardContent className="flex h-full flex-col p-4">
                      {/* Services */}
                      <div className="flex flex-wrap gap-1">
                        {req.services.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-[10px]">
                            {s}
                          </Badge>
                        ))}
                        {req.services.length > 3 && (
                          <Badge variant="secondary" className="text-[10px]">
                            +{req.services.length - 3}
                          </Badge>
                        )}
                        {statusInfo && (
                          <Badge className={`ml-auto text-[10px] ${statusInfo.color}`}>
                            {statusInfo.label}
                          </Badge>
                        )}
                      </div>

                      {/* Details */}
                      <div className="mt-3 space-y-1.5 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="truncate">
                            {req.locations.slice(0, 2).join("、")}
                            {req.locations.length > 2 && ` +${req.locations.length - 2}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Wallet className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span className="font-medium text-[var(--brand)]">{req.budget_range}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                          <span>
                            {req.preferred_date}
                            {req.preferred_time && ` ${req.preferred_time}`}
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-auto flex items-center justify-between pt-3 text-xs">
                        <span className="text-gray-400">{timeAgo(req.created_at)}</span>
                        <span className="flex items-center gap-1 text-[var(--brand)]">
                          <MessageSquareQuote className="h-3.5 w-3.5" />
                          {req.response_count > 0
                            ? `${req.response_count} 位設計師已報價`
                            : "等待報價中"}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-full bg-white px-6 py-2 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 disabled:opacity-50"
            >
              {loadingMore ? "載入中..." : "載入更多需求"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
