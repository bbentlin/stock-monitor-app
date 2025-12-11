"use client";

import React, { useState, useEffect } from "react";

interface AutoRefreshIndicatorProps {
  interval: number; // in seconds
  onRefresh: () => void;
}

const AutoRefreshIndicator: React.FC<AutoRefreshIndicatorProps> = ({ interval, onRefresh }) => {
  const [secondsLeft, setSecondsLeft] = useState(interval);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          onRefresh();
          return interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interval, onRefresh]);

  return (
    <div className="flex items-center gap-2 text-gray-400 text-sm">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span>Auto-refresh in {secondsLeft}s</span>
    </div>
  );
};

export default AutoRefreshIndicator;