"use client";

import useSWR, { type SWRConfiguration } from "swr";
import { useLiff } from "./liff";
import { useCallback } from "react";

/**
 * SWR hook with automatic LINE LIFF auth token injection.
 * Replaces useEffect + authFetch patterns for GET requests.
 *
 * - Only fetches when LIFF is ready and user is logged in
 * - Pass `null` as url to skip fetching (for dependent queries)
 * - 30s dedup interval, no revalidation on window focus
 */
export function useAuthSWR<T = unknown>(
  url: string | null,
  config?: SWRConfiguration<T>
) {
  const { liff, isReady, isLoggedIn } = useLiff();

  const fetcher = useCallback(
    async (url: string): Promise<T> => {
      const idToken = liff?.getIDToken?.();
      const headers: Record<string, string> = {};
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }
      const res = await fetch(url, { headers });
      if (!res.ok) {
        const err = new Error("Fetch failed") as Error & { status: number };
        err.status = res.status;
        throw err;
      }
      return res.json();
    },
    [liff]
  );

  // Only fetch when LIFF is ready, user is logged in, and URL is provided
  const key = isReady && isLoggedIn && url ? url : null;

  return useSWR<T>(key, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 30_000,
    ...config,
  });
}
