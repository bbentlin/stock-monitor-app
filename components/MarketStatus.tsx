"use client";

import React, { useState, useEffect } from "react";

const MarketStatus: React.FC = () => {
  const [status, setStatus] = useState<"open" | "closed" | "pre" | "after">("closed");

  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date();
      const nyTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
      const hours = nyTime.getHours();
      const minutes = nyTime.getMinutes();
      const day = nyTime.getDay();
      const time = hours * 60 + minutes;

      // Weekend
      if (day === 0 || day === 6) {
        setStatus("closed");
        return;
      }

      // Market hours: 9:30 AM - 4:00 PM ET
      const marketOpen = 9 * 60 + 30;
      const marketClose = 16 * 60;
      const preMarketOpen = 4 * 60;
      const afterMarketClose = 20 * 60;

      if (time >= marketOpen && time < marketClose) {
        setStatus("open");
      } else if (time >= preMarketOpen && time < marketOpen) {
        setStatus("pre");
      } else if (time >= marketClose && time < afterMarketClose) {
        setStatus("after");
      } else {
        setStatus("closed");
      }
    };

    checkMarketStatus();
    const interval = setInterval(checkMarketStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  const statusConfig = {
    open: { label: "Open", color: "bg-green-500", textColor: "text-green-600 dark:text-green-400" },
    closed: { label: "Closed", color: "bg-gray-400", textColor: "text-gray-500 dark:text-gray-400" },
    pre: { label: "Pre-Market", color: "bg-yellow-500", textColor: "text-yellow-600 dark:text-yellow-400" },
    after: { label: "After-Hours", color: "bg-blue-500", textColor: "text-blue-600 dark:text-blue-400" },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-2 h-2 rounded-full ${config.color} ${
          status === "open" ? "animate-pulse" : ""
        }`}
      />
      <span className={`text-xs font-medium ${config.textColor}`}>
        {config.label}
      </span>
    </div>
  );
};

export default MarketStatus;