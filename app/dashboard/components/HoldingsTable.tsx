"use client";

import React from "react";
import { Holding } from "@/lib/hooks/useHoldings";
import { useLivePrices } from "@/lib/hooks/useLivePrices";

interface HoldingsTableProps {
  holdings: Holding[];
  onRemove: (lotId: string) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onRemove }) => {
  const safeHoldings = holdings || [];
  const { liveHoldings, loading, lastUpdated, error, refresh } = useLivePrices(safeHoldings);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (safeHoldings.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Holdings</h2>
        <p className="text-gray-400 text-lg">No holdings yet</p>
        <p className="text-gray-500 text-sm mt-2">Add a stock above to start tracking your portfolio</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Holdings</h2>
        <div className="flex items-center gap-4">
          {error && (
            <span className="text-red-400 text-sm">{error}</span>
          )}
          {lastUpdated && (
            <span className="text-gray-500 text-sm">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-1.5 rounded text-sm transition-colors"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-400 text-sm font-medium">Symbol</th>
              <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-400 text-sm font-medium">Name</th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">Shares</th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">Purchase</th>
              <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-400 text-sm font-medium">Date</th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">
                Current
                {loading && <span className="ml-1 text-blue-400">●</span>}
              </th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">Value</th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">Gain/Loss</th>
              <th className="py-3 px-4 border-b border-gray-700 text-center text-gray-400 text-sm font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {liveHoldings.map((holding) => {
              const currentPrice = holding.livePrice ?? holding.currentPrice;
              const value = holding.liveValue ?? holding.value;
              const gainLoss = holding.liveGainLoss ?? holding.gainLoss;
              const gainLossPercent = holding.liveGainLossPercent ?? holding.gainLossPercent;
              const hasLivePrice = holding.livePrice !== undefined;

              return (
                <tr key={holding.lotId || `${holding.symbol}-${Math.random()}`} className="hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4 border-b border-gray-700 text-white font-semibold">{holding.symbol}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-gray-300">{holding.name}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-right text-gray-300">{holding.shares}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-right text-gray-300">${holding.purchasePrice.toFixed(2)}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-gray-400 text-sm">{formatDate(holding.purchaseDate)}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-right">
                    <span className={hasLivePrice ? "text-white" : "text-gray-400"}>
                      ${currentPrice.toFixed(2)}
                    </span>
                    {hasLivePrice && (
                      <span className="ml-1 text-green-500 text-xs">●</span>
                    )}
                  </td>
                  <td className="py-3 px-4 border-b border-gray-700 text-right text-white font-semibold">${value.toFixed(2)}</td>
                  <td className={`py-3 px-4 border-b border-gray-700 text-right font-semibold ${gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)} ({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%)
                  </td>
                  <td className="py-3 px-4 border-b border-gray-700 text-center">
                    <button
                      onClick={() => onRemove(holding.lotId)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
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
      <div className="p-3 bg-gray-900 text-gray-500 text-xs flex items-center gap-2">
        <span className="text-green-500">●</span> Live price
        <span className="mx-2">|</span>
        Prices auto-refresh every 60 seconds
      </div>
    </div>
  );
};

export default HoldingsTable;