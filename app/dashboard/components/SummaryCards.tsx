"use client";

import React, { useEffect, useMemo } from "react";
import { Holding } from "@/types";
import { useWebSocket } from "@/lib/context/WebSocketContext";

interface SummaryCardsProps {
  holdings: Holding[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ holdings }) => {
  const safeHoldings = holdings || [];
  const { prices: wsPrices, connected, subscribe, unsubscribe } = useWebSocket();

  // Subscribe to all holding symbols
  useEffect(() => {
    const symbols = safeHoldings.map((h) => h.symbol);
    if (symbols.length > 0) {
      subscribe(symbols);
    }
    return () => {
      if (symbols.length > 0) {
        unsubscribe(symbols);
      }
    };
  }, [safeHoldings, subscribe, unsubscribe]);

  // Calculate live totals
  const { liveTotalValue, totalCost, liveTotalGainLoss, totalGainLossPercent, liveHoldings } = useMemo(() => {
    let value = 0;
    let cost = 0;

    const holdingsWithLive = safeHoldings.map((holding) => {
      const livePrice = wsPrices[holding.symbol] ?? holding.currentPrice;
      const liveValue = holding.shares * livePrice;
      const costBasis = holding.shares * holding.purchasePrice;
      const liveGainLoss = liveValue - costBasis;
      const liveGainLossPercent = costBasis > 0 ? (liveGainLoss / costBasis) * 100 : 0;

      value += liveValue;
      cost += costBasis;

      return {
        ...holding,
        livePrice,
        liveValue,
        liveGainLoss,
        liveGainLossPercent,
      };
    });

    const gainLoss = value - cost;
    const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

    return {
      liveTotalValue: value,
      totalCost: cost,
      liveTotalGainLoss: gainLoss,
      totalGainLossPercent: gainLossPercent,
      liveHoldings: holdingsWithLive,
    };
  }, [safeHoldings, wsPrices]);

  const bestPerformer = liveHoldings.length > 0
    ? liveHoldings.reduce((best, h) => (h.liveGainLossPercent > best.liveGainLossPercent ? h : best))
    : null;

  const worstPerformer = liveHoldings.length > 0
    ? liveHoldings.reduce((worst, h) => (h.liveGainLossPercent < worst.liveGainLossPercent ? h : worst))
    : null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Value */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
          {connected && (
            <span className="text-green-500 text-xs" title="Live">●</span>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(liveTotalValue)}
        </p>
      </div>

      {/* Total Cost */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Cost</h3>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatCurrency(totalCost)}
        </p>
      </div>

      {/* Total Gain/Loss */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total Gain/Loss</h3>
        <p className={`text-2xl font-bold ${totalGainLossPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
          {liveTotalGainLoss >= 0 ? "+" : ""}{formatCurrency(liveTotalGainLoss)}
        </p>
        <p className={`text-sm ${totalGainLossPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
          {totalGainLossPercent >= 0 ? "+" : ""}{totalGainLossPercent.toFixed(2)}%
        </p>
      </div>

      {/* Best/Worst Performers */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Top Performers</h3>
        {bestPerformer && (
          <div className="mb-2">
            <span className="text-green-500 font-medium">{bestPerformer.symbol}</span>
            <span className="text-green-500 text-sm ml-2">
              +{bestPerformer.liveGainLossPercent.toFixed(2)}%
            </span>
          </div>
        )}
        {worstPerformer && (
          <div>
            <span className="text-red-500 font-medium">{worstPerformer.symbol}</span>
            <span className="text-red-500 text-sm ml-2">
              {worstPerformer.liveGainLossPercent.toFixed(2)}%
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;