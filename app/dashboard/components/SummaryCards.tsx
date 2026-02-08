"use client";

import React from "react";
import { Holding } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";

interface SummaryCardsProps {
  holdings: Holding[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ holdings }) => {
  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalCost = holdings.reduce(
    (sum, h) => sum + h.shares * h.purchasePrice,
    0
  );
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const dayChange = holdings.reduce(
    (sum, h) => sum + (h.change ?? 0) * h.shares,
    0
  );
  const dayChangePercent = 
    totalValue > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

  const cards = [
    {
      label: "Total Value",
      value: formatCurrency(totalValue),
      subValue: `${holdings.length} holdings`,
      color: "text-gray-900 dark:text-white",
    },
    {
      label: "Today's Change",
      value: formatCurrency(dayChange),
      subValue: formatPercent(dayChangePercent),
      color: dayChange >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Total Gain/Loss",
      value: formatCurrency(totalGain),
      subValue: formatPercent(totalGainPercent),
      color: totalGain >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      label: "Total Cost Basis",
      value: formatCurrency(totalCost),
      subValue: "Investment",
      color: "text-gray-900 dark:text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
        >
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {card.label}
          </p>
          <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
          <p className={`text-sm ${card.color}`}>{card.subValue}</p>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;