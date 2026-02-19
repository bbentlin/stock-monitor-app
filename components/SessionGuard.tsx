"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

const HEARTBEAT_KEY = "session-heartbeat";
const HEARTBEAT_INTERVAL = 3000; // 3 seconds
const HEARTBEAT_TIMEOUT = 6000; // 6 seconds (session is stale after this)

export default function SessionGuard() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const logoutCalledRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>(null);

  // Write a heartbeat to localStorage (shared across tabs)
  const startHeartbeat = useCallback(() => {
    // Immediately write one
    localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());

    heartbeatRef.current = setInterval(() => {
      localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());
    }, HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // -- Handle internet connection loss --
    const handleOffline = () => {
      if (!logoutCalledRef.current) {
        logoutCalledRef.current = true;
        signOut({ callbackUrl: "/auth/signin" });
      }
    };

    window.addEventListener("offline", handleOffline);

    // --- Heartbeat system ---
    startHeartbeat();

    // When the page is hidden (tab close, navigate away, BUT also refresh),
    // stop the heartbeat. On refresh it restarts automatically
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopHeartbeat();
      } else {
        startHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopHeartbeat();
    };
  }, [isAuthenticated, startHeartbeat, stopHeartbeat]);

  // On mount: check if the heartbeat is stale i.e. previous tab closed, not refreshed
  useEffect(() => {
    if (!isAuthenticated) return;

    const lastHeartbeat = localStorage.getItem(HEARTBEAT_KEY);

    if (lastHeartbeat) {
      const elapsed = Date.now() - parseInt(lastHeartbeat, 10);

      if (elapsed > HEARTBEAT_TIMEOUT) {
        // The previous session's heartbeat expired - the tab was closed
        // Invalitdate the server session
        fetch("/api/auth/signout-beacon", { method: "POST" }).then(() => {
          signOut({ callbackUrl: "/auth/signin" });
        });
      }
    }
  }, [isAuthenticated]);

  return null;
}