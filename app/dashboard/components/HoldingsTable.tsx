"use client";

import React from "react";
import { Holding } from "@/lib/hooks/useHoldings";
import { useLivePrices } from "@/lib/hooks/useLivePrices";
import Link from "next/link";

interface HoldingsTableProps {
  holdings: Holding[];
  onRemove: (lotId: string) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onRemove }) => {
  const safeHoldings = holdings || [];
  const { liveHoldings, loading, lastUpdated, error, refresh } = useLivePrices(safeHoldings);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (safeHoldings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-400">No holdings yet. Add your first stock above!</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Holdings</h2>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={refresh}
            disabled={loading}
            className="text-blue-500 hover:text-blue-400 text-sm disabled:opacity-50"
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-300 dark:border-yellow-700">
          <p className="text-yellow-800 dark:text-yellow-200 text-sm">{error}</p>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Symbol</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Shares</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Avg Cost</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Price</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Value</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Gain/Loss</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Date</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {liveHoldings.map((holding) => (
              <tr key={holding.lotId} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3">
                  <Link href={`/stocks/${holding.symbol}`} className="text-blue-500 hover:text-blue-400 font-medium">
                    {holding.symbol}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{holding.name}</p>
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">{holding.shares}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">${holding.purchasePrice.toFixed(2)}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  ${(holding.livePrice || holding.currentPrice).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-gray-900 dark:text-white">
                  ${(holding.liveValue || holding.value).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <span className={(holding.liveGainLoss || holding.gainLoss) >= 0 ? "text-green-500" : "text-red-500"}>
                    {(holding.liveGainLoss || holding.gainLoss) >= 0 ? "+" : ""}
                    ${(holding.liveGainLoss || holding.gainLoss).toFixed(2)}
                    <span className="text-sm ml-1">
                      ({(holding.liveGainLossPercent || holding.gainLossPercent).toFixed(2)}%)
                    </span>
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm">
                  {formatDate(holding.purchaseDate)}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onRemove(holding.lotId)}
                    className="text-red-500 hover:text-red-400 text-sm"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;