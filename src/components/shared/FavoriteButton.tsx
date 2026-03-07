"use client";

import { useCallback, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { useAuthFetch } from "@/lib/line/use-auth-fetch";

interface FavoriteButtonProps {
  artistId: string;
}

export default function FavoriteButton({ artistId }: FavoriteButtonProps) {
  const { authFetch, isReady } = useAuthFetch();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Check initial favorite status
  useEffect(() => {
    if (!isReady) return;
    authFetch("/api/favorites")
      .then((res) => (res.ok ? res.json() : []))
      .then((favorites: { artist_id: string }[]) => {
        const found = favorites.some((f) => f.artist_id === artistId);
        setIsFavorited(found);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [isReady, authFetch, artistId]);

  const handleToggle = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Optimistic update
      const prev = isFavorited;
      setIsFavorited(!prev);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);

      try {
        const res = await authFetch("/api/favorites", {
          method: prev ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artistId }),
        });

        if (!res.ok) {
          // Revert on failure
          setIsFavorited(prev);
        }
      } catch {
        setIsFavorited(prev);
      }
    },
    [isFavorited, authFetch, artistId]
  );

  if (!loaded) return null;

  return (
    <button
      onClick={handleToggle}
      className="group relative inline-flex items-center justify-center rounded-full p-1.5 transition-colors hover:bg-pink-50"
      aria-label={isFavorited ? "取消收藏" : "加入收藏"}
    >
      <Heart
        className={`h-5 w-5 transition-all duration-200 ${
          isAnimating ? "scale-125" : "scale-100"
        } ${
          isFavorited
            ? "fill-red-500 text-red-500"
            : "fill-none text-gray-400 group-hover:text-red-400"
        }`}
      />
    </button>
  );
}
