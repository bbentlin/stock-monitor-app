"use client";

import React, { useEffect } from "react";
import { Holding } from "@/types";
import { useWebSocket } from "@/lib/context/WebSocketContext";
import { usePriceFlash } from "@/lib/hooks/usePriceFlash";

interface HoldingsTableProps {
  holdings: Holding[];
  onRemove: (id: string) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onRemove }) => {
  const { prices: wsPrices, connected, subscribe, unsubscribe } = useWebSocket();
  const flashes = usePriceFlash(wsPrices);

  // Subscribe to holding symbols for real-time updates
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  if (holdings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No holdings yet. Add your first stock above.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Holdings</h2>
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-yellow-500"}`}
            title={connected ? "Live prices" : "Connecting..."}
          />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {holdings.length} {holdings.length === 1 ? "position" : "positions"}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Shares
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Avg Cost
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Price
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Value
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {holdings.map((holding) => {
              // Use WebSocket price if available, otherwise use stored price
              const livePrice = wsPrices[holding.symbol] ?? holding.currentPrice;
              const isLive = wsPrices[holding.symbol] !== undefined;
              const flash = flashes[holding.symbol];

              // Recalculate values with live price
              const liveValue = holding.shares * livePrice;
              const costBasis = holding.shares * holding.purchasePrice;
              const liveGainLoss = liveValue - costBasis;
              const liveGainLossPercent = costBasis > 0 ? (liveGainLoss / costBasis) * 100 : 0;

              return (
                <tr
                  key={holding.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {holding.symbol}
                      </span>
                      {isLive && (
                        <span className="text-green-500 text-xs" title="Live price">
                          ●
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {holding.name}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                    {holding.shares.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                    {formatCurrency(holding.purchasePrice)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={`font-medium transition-colors duration-300 ${
                        flash === "up"
                          ? "text-green-500"
                          : flash === "down"
                          ? "text-red-500"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {formatCurrency(livePrice)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right text-gray-900 dark:text-white">
                    {formatCurrency(liveValue)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div
                      className={`${
                        liveGainLoss >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      <div>{formatCurrency(liveGainLoss)}</div>
                      <div className="text-sm">{formatPercent(liveGainLossPercent)}</div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => onRemove(holding.id)}
                      className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;