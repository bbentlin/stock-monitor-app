"use client";

import React from "react";
import { useWebSocket } from "@/lib/context/WebSocketContext";

const WebSocketStatus: React.FC = () => {
  const { connected, error, prices } = useWebSocket();

  // Don't show anything if connected or if we have fallback prices
  if (connected || Object.keys(prices).length > 0) return null;
  
  // Only show if there's an error AND no prices available
  if (!error) return null;

  return (
    <div className="fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-sm flex items-center gap-2 z-50 transition-all duration-300 bg-yellow-500 text-white">
      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
      <span>Using delayed quotes (market may be closed)</span>
    </div>
  );
};

export default WebSocketStatus;