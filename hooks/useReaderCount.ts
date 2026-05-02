"use client";

import { useEffect, useRef, useState } from "react";

const POLL_INTERVAL = 5000;

function generateSessionId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useReaderCount(): number | null {
  const [count, setCount] = useState<number | null>(null);
  const sessionIdRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = generateSessionId();

    const heartbeat = async () => {
      try {
        const res = await fetch("/api/presence", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: sessionIdRef.current }),
        });
        if (res.ok) {
          const data = await res.json();
          setCount(data.count);
        }
      } catch {
        // Silently ignore network errors
      }
    };

    heartbeat();
    const interval = setInterval(heartbeat, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return count;
}
