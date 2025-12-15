"use client";

import React from "react";
import { Holding } from "@/lib/hooks/useHoldings";
import { useLivePrices } from "@/lib/hooks/useLivePrices";

interface SummaryCardsProps {
  holdings: Holding[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ holdings }) => {
  const safeHoldings = holdings || [];
  const { liveHoldings, liveTotalValue, liveTotalGainLoss, loading } = useLivePrices(safeHoldings);
  
  const totalCost = safeHoldings.reduce((sum, h) => sum + (h.shares * h.purchasePrice), 0);
  const totalGainLossPercent = totalCost > 0 ? (liveTotalGainLoss / totalCost) * 100 : 0;

  const bestPerformer = liveHoldings.length > 0
    ? liveHoldings.reduce((best, h) => {
        const percent = h.liveGainLossPercent ?? h.gainLossPercent;
        const bestPercent = best.liveGainLossPercent ?? best.gainLossPercent;
        return percent > bestPercent ? h : best;
      })
    : null;

  const worstPerformer = liveHoldings.length > 0
    ? liveHoldings.reduce((worst, h) => {
        const percent = h.liveGainLossPercent ?? h.gainLossPercent;
        const worstPercent = worst.liveGainLossPercent ?? worst.gainLossPercent;
        return percent < worstPercent ? h : worst;
      })
    : null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-400 text-sm mb-2">Total Portfolio Value</h3>
          {loading && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </div>
        <p className="text-white text-2xl font-bold">${liveTotalValue.toFixed(2)}</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-gray-400 text-sm mb-2">Total Gain/Loss</h3>
          {loading && (
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
          )}
        </div>
        <p className={`text-2xl font-bold ${liveTotalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
          {liveTotalGainLoss >= 0 ? "+" : ""}${liveTotalGainLoss.toFixed(2)}
          <span className="text-sm ml-2">({totalGainLossPercent >= 0 ? "+" : ""}{totalGainLossPercent.toFixed(2)}%)</span>
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-gray-400 text-sm mb-2">Best Performer</h3>
        {bestPerformer ? (
          <>
            <p className="text-white text-xl font-bold">{bestPerformer.symbol}</p>
            <p className="text-green-500 text-sm">
              +{(bestPerformer.liveGainLossPercent ?? bestPerformer.gainLossPercent).toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-gray-500">No holdings yet</p>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-gray-400 text-sm mb-2">Worst Performer</h3>
        {worstPerformer ? (
          <>
            <p className="text-white text-xl font-bold">{worstPerformer.symbol}</p>
            <p className={`text-sm ${(worstPerformer.liveGainLossPercent ?? worstPerformer.gainLossPercent) >= 0 ? "text-green-500" : "text-red-500"}`}>
              {(worstPerformer.liveGainLossPercent ?? worstPerformer.gainLossPercent) >= 0 ? "+" : ""}
              {(worstPerformer.liveGainLossPercent ?? worstPerformer.gainLossPercent).toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-gray-500">No holdings yet</p>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;