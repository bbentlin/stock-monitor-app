"use client";

import React from "react";
import { useWebSocket } from "@/lib/context/WebSocketContext";

const WebSocketStatus: React.FC = () => {
  const { connected, error } = useWebSocket();

  // Only show when there's an issue (don't clutter UI when everything is fine)
  if (connected && !error) return null;

  return (
    <div
      className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-50 transition-all duration-300 ${
        error 
          ? "bg-red-500 text-white"
          : "bg-yellow-500 text-white"
      }`}
    >
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      <span>
        {error || "Connecting to live prices..."}
      </span>
      {error && (
        <button
          onClick={() => window.location.reload()}
          className="ml-2 underline hover:no-underline text-white/90 hover:text-white"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default WebSocketStatus;