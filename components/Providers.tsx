"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { WebSocketProvider } from "@/lib/context/WebSocketContext";
import { ToastProvider } from "./Toast";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <WebSocketProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WebSocketProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}