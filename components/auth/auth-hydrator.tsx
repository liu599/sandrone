"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";

export function AuthHydrator() {
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  return null;
}
