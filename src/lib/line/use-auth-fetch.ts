"use client";

import { useCallback } from "react";
import { useLiff } from "./liff";

/**
 * Hook that provides a fetch wrapper which automatically includes
 * the LINE LIFF ID token in the Authorization header.
 * Auto-refreshes expired tokens via LIFF login.
 */
export function useAuthFetch() {
  const { liff, isReady } = useLiff();

  const authFetch = useCallback(
    async (url: string, options?: RequestInit): Promise<Response> => {
      let idToken = liff?.getIDToken?.();

      // If no token, try to trigger login to get a fresh one
      if (!idToken && liff?.isLoggedIn?.()) {
        // Token expired but session exists — try getting a fresh token
        try {
          await liff.login();
          idToken = liff.getIDToken?.() ?? null;
        } catch {
          // login failed, proceed without token
        }
      }

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
