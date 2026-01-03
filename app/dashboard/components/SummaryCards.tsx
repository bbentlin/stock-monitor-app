"use client";

import React from "react";
import { Holding } from "@/types";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Value</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {loading ? "..." : `$${liveTotalValue.toFixed(2)}`}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Gain/Loss</p>
        <p className={`text-2xl font-bold ${liveTotalGainLoss >= 0 ? "text-gray-500" : "text-red-500"}`}>
          {loading ? "..." : `$${liveTotalGainLoss >= 0 ? "+" : ""}$${liveTotalGainLoss.toFixed(2)}`}
        </p>
        <p className={`text-sm ${totalGainLossPercent >= 0 ? "text-green-500" : "text-red-500"}`}>
          {loading ? "" : `${totalGainLossPercent >= 0 ? "+" : ""}${totalGainLossPercent.toFixed(2)}%`}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Best Performer</p>
        {bestPerformer ? (
          <>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{bestPerformer.symbol}</p>
            <p className="text-sm text-green-500">
              +{(bestPerformer.liveGainLossPercent ?? bestPerformer.gainLossPercent).toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">N/A</p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Worst Performer</p>
        {worstPerformer ? (
          <>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{worstPerformer.symbol}</p>
            <p className="text-sm text-red-500">
              {(worstPerformer.liveGainLossPercent ?? worstPerformer.gainLossPercent).toFixed(2)}%
            </p>
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">N/A</p>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;