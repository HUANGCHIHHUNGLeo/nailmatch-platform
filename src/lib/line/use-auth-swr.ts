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
 * - Does not retry on 401/403 errors
 */
export function useAuthSWR<T = unknown>(
  url: string | null,
  config?: SWRConfiguration<T>
) {
  const { liff, isReady, isLoggedIn } = useLiff();

  const fetcher = useCallback(
    async (url: string): Promise<T> => {
      const idToken = liff?.getIDToken?.();
      if (!idToken) {
        console.warn("[useAuthSWR] No ID token available for", url);
      }
      const headers: Record<string, string> = {};
      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }
      const res = await fetch(url, { headers });
      if (!res.ok) {
        console.error(`[useAuthSWR] ${url} returned ${res.status}`);
        const err = new Error(`Fetch failed: ${res.status}`) as Error & { status: number };
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
    onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
      // Don't retry on auth errors
      if ((error as Error & { status?: number }).status === 401) return;
      if ((error as Error & { status?: number }).status === 403) return;
      // Only retry up to 2 times for other errors
      if (retryCount >= 2) return;
      setTimeout(() => revalidate({ retryCount }), 3000);
    },
    ...config,
  });
}
