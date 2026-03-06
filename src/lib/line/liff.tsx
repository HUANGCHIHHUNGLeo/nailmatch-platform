"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type liff from "@line/liff";

type Liff = typeof liff;

interface LiffContextType {
  liff: Liff | null;
  isLoggedIn: boolean;
  isInClient: boolean;
  isReady: boolean;
  error: Error | null;
  profile: {
    userId: string;
    displayName: string;
    pictureUrl?: string;
  } | null;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  isLoggedIn: false,
  isInClient: false,
  isReady: false,
  error: null,
  profile: null,
});

export function LiffProvider({
  children,
  requireLogin = false,
}: {
  children: ReactNode;
  requireLogin?: boolean;
}) {
  const [liffInstance, setLiffInstance] = useState<Liff | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<LiffContextType["profile"]>(null);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId || liffId === "your_liff_id") {
      console.warn("LIFF ID not configured, skipping LIFF initialization");
      setIsReady(true);
      return;
    }

    // Timeout to prevent infinite hanging
    const timeout = setTimeout(() => {
      console.warn("LIFF init timed out after 5s, proceeding without LIFF");
      setIsReady(true);
    }, 5000);

    import("@line/liff")
      .then((liffModule) => {
        const liffObj = liffModule.default;
        return liffObj.init({ liffId }).then(() => liffObj);
      })
      .then(async (liffObj) => {
        clearTimeout(timeout);
        setLiffInstance(liffObj);
        setIsInClient(liffObj.isInClient());

        if (liffObj.isLoggedIn()) {
          setIsLoggedIn(true);
          try {
            const userProfile = await liffObj.getProfile();
            setProfile({
              userId: userProfile.userId,
              displayName: userProfile.displayName,
              pictureUrl: userProfile.pictureUrl,
            });
          } catch (err) {
            console.error("Failed to get LINE profile:", err);
          }
          setIsReady(true);
        } else if (requireLogin && !liffObj.isInClient()) {
          // Redirect to LINE Login for pages that require authentication
          liffObj.login({ redirectUri: window.location.href });
          return; // Don't set isReady — page will reload after login
        } else {
          setIsReady(true);
        }
      })
      .catch((err: Error) => {
        clearTimeout(timeout);
        console.error("LIFF init failed:", err);
        setError(err);
        setIsReady(true);
      });

    return () => clearTimeout(timeout);
  }, []);

  return (
    <LiffContext.Provider
      value={{ liff: liffInstance, isLoggedIn, isInClient, isReady, error, profile }}
    >
      {children}
    </LiffContext.Provider>
  );
}

export function useLiff() {
  const context = useContext(LiffContext);
  if (!context) {
    throw new Error("useLiff must be used within a LiffProvider");
  }
  return context;
}
