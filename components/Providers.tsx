"use client";

import { SessionProvider } from "next-auth/react";
import { WebSocketProvider } from "@/lib/context/WebSocketContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WebSocketProvider>
        {children}
      </WebSocketProvider>
    </SessionProvider>
  );
}