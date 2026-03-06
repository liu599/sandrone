"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

export function AuthHydrator() {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);
  const checkTokenExpiration = useAuthStore((s) => s.checkTokenExpiration);

  useEffect(() => {
    // Hydrate auth state on mount
    hydrateFromStorage();

    // Set up periodic token expiration check
    const intervalId = setInterval(() => {
      checkTokenExpiration();
    }, TOKEN_CHECK_INTERVAL);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, [hydrateFromStorage, checkTokenExpiration]);

  return null;
}
