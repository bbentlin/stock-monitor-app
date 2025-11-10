"use client";

import React from "react";
import { Holding } from "@/lib/hooks/useHoldings";

interface SummaryCardsProps {
  holdings: Holding[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ holdings }) => {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalGainLoss = holdings.reduce((sum, h) => sum + h.gainLoss, 0);
  const totalGainLossPercent = holdings.length > 0
    ? (totalGainLoss / (totalValue - totalGainLoss)) * 100
    : 0;

  const bestPerformer = holdings.length > 0
    ? holdings.reduce((best, h) => h.gainLossPercent > best.gainLossPercent ? h : best)
    : null;

  const worstPerformer = holdings.length > 0
    ? holdings.reduce((worst, h) => h.gainLossPercent < worst.gainLossPercent ? h : worst)
    : null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-gray-400 text-sm mb-2">Total Portfolio Value</h3>
        <p className="text-white text-2xl font-bold">${totalValue.toFixed(2)}</p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-gray-400 text-sm mb-2">Total Gain/Loss</h3>
        <p className={`text-2xl font-bold ${totalGainLoss >= 0 ? "text-green-500" : "text-red-500"}`}>
          ${totalGainLoss.toFixed(2)}
          <span className="text-sm ml-2">({totalGainLossPercent.toFixed(2)}%)</span>
        </p>
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-gray-400 text-sm mb-2">Best Performer</h3>
        {bestPerformer ? (
          <>
            <p className="text-white text-xl font-bold">{bestPerformer.symbol}</p>
            <p className="text-green-500 text-sm">+{bestPerformer.gainLossPercent.toFixed(2)}%</p>
          </>
        ) : (
          <p className="text-gray-500">N/A</p>
        )}
      </div>

      <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
        <h3 className="text-gray-400 text-sm mb-2">Worst Performer</h3>
        {worstPerformer ?  (
          <>
            <p className="text-white text-xl font-bold">{worstPerformer.symbol}</p>
            <p className="text-red-500 text-sm">{worstPerformer.gainLossPercent.toFixed(2)}%</p>
          </>
        ) : (
          <p className="text-gray-500">N/A</p>
        )}
      </div>
    </div>
  );
};

export default SummaryCards;