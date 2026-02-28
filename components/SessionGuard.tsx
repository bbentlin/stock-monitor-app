"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

const HEARTBEAT_KEY = "session-heartbeat";
const HEARTBEAT_INTERVAL = 3000;
const HEARTBEAT_TIMEOUT = 6000;

export default function SessionGuard() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const logoutCalledRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>(null);

  const startHeartbeat = useCallback(() => {
    localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());

    heartbeatRef.current = setInterval(() => {
      localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());
    }, HEARTBEAT_INTERVAL);
  }, []);

  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // Clean up heartbeat when user signs out normally
  useEffect(() => {
    if (status === "unauthenticated") {
      stopHeartbeat();
      localStorage.removeItem(HEARTBEAT_KEY);
      logoutCalledRef.current = false;
    }
  }, [status, stopHeartbeat]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleOffline = () => {
      if (!logoutCalledRef.current) {
        logoutCalledRef.current = true;
        signOut({ callbackUrl: "/auth/signin" });
      }
    };

    window.addEventListener("offline", handleOffline);

    startHeartbeat();

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

  useEffect(() => {
    if (!isAuthenticated) return;

    const lastHeartbeat = localStorage.getItem(HEARTBEAT_KEY);

    if (lastHeartbeat) {
      const elapsed = Date.now() - parseInt(lastHeartbeat, 10);

      if (elapsed > HEARTBEAT_TIMEOUT) {
        const wasActiveTab = sessionStorage.getItem("session-guard-active");
        if (wasActiveTab) {
          if (!logoutCalledRef.current) {
            logoutCalledRef.current = true;
            fetch("/api/auth/signout-beacon", { method: "POST" }).then(() => {
              signOut({ callbackUrl: "/auth/signin" });
            });
          }
          return;
        }
        localStorage.removeItem(HEARTBEAT_KEY);
      }
    }

    sessionStorage.setItem("session-guard-active", "true");
  }, [isAuthenticated]);

  return null;
}