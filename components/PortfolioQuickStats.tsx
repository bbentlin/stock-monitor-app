"use client";

import React, { useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useWebSocket } from "@/lib/context/WebSocketContext";
import { Holding } from "@/types";

interface PortfolioQuickStatsProps {
  holdings: Holding[];
}

const PortfolioQuickStats: React.FC<PortfolioQuickStatsProps> = ({ holdings }) => {
  const { prices: wsPrices, subscribe, unsubscribe } = useWebSocket();

  useEffect(() => {
    const symbols = holdings.map((h) => h.symbol);
    if (symbols.length > 0) {
      subscribe(symbols);
    }
    return () => {
      if (symbols.length > 0) {
        unsubscribe(symbols);
      }
    };
  }, [holdings, subscribe, unsubscribe]);

  const { totalValue, totalGainLoss, totalGainLossPercent } = useMemo(() => {
    let value = 0;
    let cost = 0;

    holdings.forEach((holding) => {
      const livePrice = wsPrices[holding.symbol] ?? holding.currentPrice;
      value += holding.shares * livePrice;
      cost += holding.shares * holding.purchasePrice;
    });

    const gainLoss = value - cost;
    const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

    return { totalValue: value, totalGainLoss: gainLoss, totalGainLossPercent: gainLossPercent };
  }, [holdings, wsPrices]);

  const formatCompact = (value: number) => {
    if (Math.abs(value) >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(value) >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  if (holdings.length === 0) {
    return null;
  }

  return (
    <div className="hidden lg:flex items-center gap-4 px-4 py-1.5 bg-gray-200/50 dark:bg-gray-700/50 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Portfolio</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {formatCompact(totalValue)}
        </span>
      </div>
      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />
      <div className="flex items-center gap-1">
        <span
          className={`text-sm font-medium ${
            totalGainLoss >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {totalGainLoss >= 0 ? "+" : ""}
          {formatCompact(totalGainLoss)}
        </span>
        <span
          className={`text-xs ${
            totalGainLossPercent >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          ({totalGainLossPercent >= 0 ? "+" : ""}
          {totalGainLossPercent.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

export default PortfolioQuickStats;