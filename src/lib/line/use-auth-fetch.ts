"use client";

import { useCallback } from "react";
import { useLiff } from "./liff";

/**
 * Hook that provides a fetch wrapper which automatically includes
 * the LINE LIFF ID token in the Authorization header.
 */
export function useAuthFetch() {
  const { liff, isReady } = useLiff();

  const authFetch = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      const idToken = liff?.getIDToken?.();
      const headers: Record<string, string> = {
        ...(options?.headers as Record<string, string> || {}),
      };

      if (idToken) {
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      return fetch(url, { ...options, headers });
    },
    [liff]
  );

  return { authFetch, isReady };
}
