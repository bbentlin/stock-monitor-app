"use client";

import { useEffect, useRef, useCallback } from "react";
import { signOut, useSession } from "next-auth/react";

const HEARTBEAT_KEY = "session-heartbeat";
const SIGNOUT_KEY = "session-signout-initiated";
const HEARTBEAT_INTERVAL = 3000;
const HEARTBEAT_TIMEOUT = 6000;

export default function SessionGuard() {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const logoutCalledRef = useRef(false);
  const heartbeatRef = useRef<ReturnType<typeof setInterval>>(null);

  const startHeartbeat = useCallback(() => {
    localStorage.setItem(HEARTBEAT_KEY, Date.now().toString());

    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

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
      localStorage.removeItem(SIGNOUT_KEY);
      logoutCalledRef.current = false;
    }
  }, [status, stopHeartbeat]);

  // Safe sign-out that checks if a sign-out is already in progress
  const safeSignOut = useCallback(() => {
    // Check if a server-action sign-out was already initiated
    const signoutInitiated = localStorage.getItem(SIGNOUT_KEY);
    if (signoutInitiated || logoutCalledRef.current) {
      return;
    }

    logoutCalledRef.current = true;
    localStorage.setItem(SIGNOUT_KEY, Date.now().toString());
    signOut({ callbackUrl: "/auth/signin" });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleOffline = () => {
      safeSignOut();
    };

    window.addEventListener("offline", handleOffline);

    startHeartbeat();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        stopHeartbeat();
      } else {
        // Check if sign-out happened while tab was hidden
        const signoutInitiated = localStorage.getItem(SIGNOUT_KEY);
        if (signoutInitiated) {
          return; // Don't restart heartbeat, sign-out is happening
        }
        startHeartbeat();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("offline", handleOffline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stopHeartbeat();
    };
  }, [isAuthenticated, startHeartbeat, stopHeartbeat, safeSignOut]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // If a sign-out is already in progress, don't do anything
    const signoutInitiated = localStorage.getItem(SIGNOUT_KEY);
    if (signoutInitiated) return;

    const lastHeartbeat = localStorage.getItem(HEARTBEAT_KEY);

    if (lastHeartbeat) {
      const elapsed = Date.now() - parseInt(lastHeartbeat, 10);

      if (elapsed > HEARTBEAT_TIMEOUT) {
        const wasActiveTab = sessionStorage.getItem("session-guard-active");
        if (wasActiveTab) {
          safeSignOut();
          return;
        }
        localStorage.removeItem(HEARTBEAT_KEY);
      }
    }

    sessionStorage.setItem("session-guard-active", "true");
  }, [isAuthenticated, safeSignOut]);

  return null;
}