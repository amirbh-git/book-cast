"use client";

import { useEffect, useRef } from "react";

export function useWakeLock() {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    const acquire = async () => {
      try {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      } catch {
        // Wake lock request can fail if the document isn't visible; ignore silently
      }
    };

    acquire();

    // Re-acquire when the page becomes visible again (e.g. after switching tabs)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") acquire();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      wakeLockRef.current?.release();
    };
  }, []);
}
