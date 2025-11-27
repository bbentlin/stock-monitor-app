"use client";

import React from "react";
import { Holding } from "@/lib/hooks/useHoldings";

interface HoldingsTableProps {
  holdings: Holding[];
  onRemove: (lotId: string) => void;
}

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onRemove }) => {
  const safeHoldings = holdings || [];

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
      <h2 className="text-2xl font-bold text-white p-4 border-b border-gray-700">Holdings</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-900">
            <tr>
              <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-400 text-sm font-medium">Symbol</th>
              <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-400 text-sm font-medium">Name</th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">Shares</th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">Purchase</th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">Current</th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">Value</th>
              <th className="py-3 px-4 border-b border-gray-700 text-right text-gray-400 text-sm font-medium">Gain/Loss</th>
              <th className="py-3 px-4 border-b border-gray-700 text-center text-gray-400 text-sm font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {safeHoldings.map((holding) => (
              <tr key={holding.lotId || `${holding.symbol}-${Math.random()}`} className="hover:bg-gray-700/50 transition-colors">
                <td className="py-3 px-4 border-b border-gray-700 text-white font-semibold">{holding.symbol}</td>
                <td className="py-3 px-4 border-b border-gray-700 text-gray-300">{holding.name}</td>
                <td className="py-3 px-4 border-b border-gray-700 text-right text-gray-300">{holding.shares}</td>
                <td className="py-3 px-4 border-b border-gray-700 text-right text-gray-300">${holding.purchasePrice.toFixed(2)}</td>
                <td className="py-3 px-4 border-b border-gray-700 text-right text-gray-300">${holding.currentPrice.toFixed(2)}</td>
                <td className="py-3 px-4 border-b border-gray-700 text-right text-white font-semibold">${holding.value.toFixed(2)}</td>
                <td className={`py-3 px-4 border-b border-gray-700 text-right font-semibold ${holding.gainLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {holding.gainLoss >= 0 ? "+" : ""}${holding.gainLoss.toFixed(2)} ({holding.gainLossPercent >= 0 ? "+" : ""}{holding.gainLossPercent.toFixed(2)}%)
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HoldingsTable;