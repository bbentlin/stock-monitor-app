"use client";

import React, { useState, useEffect } from "react";
import { useWebSocket } from "@/lib/context/WebSocketContext";

const LastUpdated: React.FC = () => {
  const { lastTrades, connected } = useWebSocket();
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [timeAgo, setTimeAgo] = useState<string>("");

  useEffect(() => {
    if (Object.keys(lastTrades).length > 0) {
      setLastUpdate(new Date());
    }
  }, [lastTrades]);

  useEffect(() => {
    const updateTimeAgo = () => {
      if (!lastUpdate) {
        setTimeAgo("");
        return;
      }

      const seconds = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);

      if (seconds < 5) {
        setTimeAgo("Just now");
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes}m ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(interval);
  }, [lastUpdate]);

  if (!connected || !timeAgo) return null;

  return (
    <span>
      Updated {timeAgo}
    </span>
  );
};