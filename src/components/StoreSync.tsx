"use client";

import { useEffect } from "react";
import { useReportStore } from "@/lib/store";

const POLL_MS = 5000;

/** Loads data from the database and keeps it fresh so every visitor sees live updates. */
export function StoreSync() {
  const fetchState = useReportStore((s) => s.fetchState);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "visible") fetchState().catch(() => {});
    };
    refresh();
    const timer = setInterval(refresh, POLL_MS);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [fetchState]);

  return null;
}
