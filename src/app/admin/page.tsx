"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Artist {
  id: string;
  display_name: string;
  avatar_url: string | null;
  phone: string;
  email: string | null;
  gender: string;
  cities: string[];
  services: string[];
  styles: string[];
  min_price: number;
  max_price: number;
  instagram_handle: string | null;
  line_id: string | null;
  role: string | null;
  studio_address: string | null;
  service_location_type: string | null;
  bio: string | null;
  line_user_id: string | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

interface Stats {
  artists: { total: number; pending: number; verified: number };
  customers: { total: number };
  requests: { total: number; pending: number; matching: number };
  bookings: { total: number; confirmed: number; completed: number };
}

type TabType = "pending" | "verified" | "all";

export default function AdminDashboard() {
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tab, setTab] = useState<TabType>("pending");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [artistRes, statsRes] = await Promise.all([
        fetch("/api/admin/artists"),
        fetch("/api/admin/stats"),
      ]);

      if (artistRes.status === 401 || statsRes.status === 401) {
        router.push("/admin/login");
        return;
      }

      const artistData = await artistRes.json();
      const statsData = await statsRes.json();

      setArtists(artistData);
      setStats(statsData);
    } catch {
      router.push("/admin/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAction = async (id: string, action: "approve" | "reject") => {
    setActionLoading(id);
    try {
      const res = await fetch("/api/admin/artists", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action }),
      });

      if (res.ok) {
        await fetchData();
      }
    } catch (err) {
      console.error("Action failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredArtists = artists.filter((a) => {
    if (tab === "pending") return !a.is_verified && a.is_active;
    if (tab === "verified") return a.is_verified;
    return true;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <h1 className="text-lg font-bold text-pink-500">NaLi Match 管理後台</h1>
          <button
            onClick={() => {
              document.cookie = "admin_session=; path=/; max-age=0";
              router.push("/admin/login");
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            登出
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-4 space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="待審核美甲師" value={stats.artists.pending} highlight />
            <StatCard label="已驗證美甲師" value={stats.artists.verified} />
            <StatCard label="顧客數" value={stats.customers.total} />
            <StatCard label="總預約數" value={stats.bookings.total} />
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
          {([
            ["pending", `待審核 (${stats?.artists.pending || 0})`],
            ["verified", `已通過 (${stats?.artists.verified || 0})`],
            ["all", `全部 (${stats?.artists.total || 0})`],
          ] as [TabType, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition ${
                tab === key
                  ? "bg-white text-pink-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Artist List */}
        {filteredArtists.length === 0 ? (
          <div className="rounded-xl bg-white p-8 text-center text-gray-400 shadow-sm">
            {tab === "pending" ? "沒有待審核的美甲師" : "沒有資料"}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArtists.map((artist) => (
              <div
                key={artist.id}
                className="rounded-xl bg-white shadow-sm overflow-hidden"
              >
                {/* Summary Row */}
                <div
                  className="flex cursor-pointer items-center gap-3 p-4"
                  onClick={() =>
                    setExpandedId(expandedId === artist.id ? null : artist.id)
                  }
                >
                  {/* Avatar */}
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-pink-100 text-lg font-bold text-pink-500">
                    {artist.avatar_url ? (
                      <img
                        src={artist.avatar_url}
                        alt=""
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      artist.display_name[0]
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {artist.display_name}
                      </span>
                      <StatusBadge artist={artist} />
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      <span className={`mr-1 inline-block rounded px-1 py-0.5 text-[10px] font-medium ${artist.role === "lash" ? "bg-purple-100 text-purple-700" : "bg-pink-100 text-pink-700"}`}>
                        {artist.role === "lash" ? "美睫" : "美甲"}
                      </span>
                      {artist.services.join("、")} · {artist.cities.slice(0, 2).join("、")}
                      {artist.cities.length > 2 && ` +${artist.cities.length - 2}`}
                    </p>
                  </div>

                  {/* Date */}
                  <span className="flex-shrink-0 text-xs text-gray-400">
                    {new Date(artist.created_at).toLocaleDateString("zh-TW")}
                  </span>

                  {/* Expand icon */}
                  <svg
                    className={`h-5 w-5 flex-shrink-0 text-gray-400 transition ${
                      expandedId === artist.id ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded Details */}
                {expandedId === artist.id && (
                  <div className="border-t bg-gray-50 p-4 space-y-3">
                    <DetailRow label="身份" value={artist.role === "lash" ? "美睫師" : "美甲師"} />
                    <DetailRow label="電話" value={artist.phone} />
                    <DetailRow label="Email" value={artist.email || "未填"} />
                    <DetailRow label="性別" value={artist.gender === "female" ? "女" : "男"} />
                    <DetailRow label="店名/工作室" value={artist.studio_address || "未填"} />
                    <DetailRow label="服務地區" value={artist.cities.join("、")} />
                    <DetailRow
                      label="服務類型"
                      value={
                        artist.service_location_type === "studio"
                          ? "工作室"
                          : artist.service_location_type === "home_service"
                          ? "到府服務"
                          : artist.service_location_type === "both"
                          ? "都可以"
                          : artist.service_location_type || "未填"
                      }
                    />
                    <DetailRow label="服務項目" value={artist.services.join("、")} />
                    <DetailRow label="擅長風格" value={artist.styles.join("、")} />
                    <DetailRow
                      label="價格範圍"
                      value={`NT$${artist.min_price} ~ NT$${artist.max_price}`}
                    />
                    {artist.instagram_handle && (
                      <DetailRow label="Instagram" value={`@${artist.instagram_handle}`} />
                    )}
                    {artist.line_id && (
                      <DetailRow label="LINE ID" value={artist.line_id} />
                    )}
                    {artist.bio && <DetailRow label="自我介紹" value={artist.bio} />}
                    <DetailRow
                      label="LINE 綁定"
                      value={artist.line_user_id ? "已綁定" : "未綁定"}
                    />

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {!artist.is_verified ? (
                        <>
                          <button
                            onClick={() => handleAction(artist.id, "approve")}
                            disabled={actionLoading === artist.id}
                            className="flex-1 rounded-lg bg-green-500 py-2.5 text-sm font-medium text-white transition hover:bg-green-600 disabled:opacity-50"
                          >
                            {actionLoading === artist.id ? "處理中..." : "通過審核"}
                          </button>
                          <button
                            onClick={() => handleAction(artist.id, "reject")}
                            disabled={actionLoading === artist.id}
                            className="flex-1 rounded-lg bg-red-500 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-50"
                          >
                            拒絕
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleAction(artist.id, "reject")}
                          disabled={actionLoading === artist.id}
                          className="rounded-lg border border-red-300 px-4 py-2 text-sm text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          撤銷驗證
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-4 shadow-sm ${
        highlight && value > 0
          ? "bg-pink-500 text-white"
          : "bg-white text-gray-900"
      }`}
    >
      <p
        className={`text-xs ${
          highlight && value > 0 ? "text-pink-100" : "text-gray-500"
        }`}
      >
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function StatusBadge({ artist }: { artist: Artist }) {
  if (artist.is_verified) {
    return (
      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
        已驗證
      </span>
    );
  }
  if (!artist.is_active) {
    return (
      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">
        已停用
      </span>
    );
  }
  return (
    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
      待審核
    </span>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 text-sm">
      <span className="w-20 flex-shrink-0 text-gray-400">{label}</span>
      <span className="text-gray-700">{value}</span>
    </div>
  );
}
