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

export function LiffProvider({ children }: { children: ReactNode }) {
  const [liffInstance, setLiffInstance] = useState<Liff | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInClient, setIsInClient] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [profile, setProfile] = useState<LiffContextType["profile"]>(null);

  useEffect(() => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;
    if (!liffId) {
      console.warn("LIFF ID not configured, skipping LIFF initialization");
      setIsReady(true);
      return;
    }

    import("@line/liff")
      .then((liffModule) => {
        const liffObj = liffModule.default;
        return liffObj.init({ liffId }).then(() => liffObj);
      })
      .then(async (liffObj) => {
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
        }

        setIsReady(true);
      })
      .catch((err: Error) => {
        console.error("LIFF init failed:", err);
        setError(err);
        setIsReady(true);
      });
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
