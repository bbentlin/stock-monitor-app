"use client";

import React, { useEffect, useMemo } from "react";
import { Holding } from "@/types";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { useWebSocket } from "@/lib/context/WebSocketContext";

interface SummaryCardsProps {
  holdings: Holding[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ holdings }) => {
  const { prices: wsPrices, subscribe, unsubscribe } = useWebSocket();

  // Subscribe to WebSocket for live prices
  useEffect(() => {
    const symbols = [...new Set(holdings.map((h) => h.symbol))];
    if (symbols.length > 0) {
      subscribe(symbols);
    }
    return () => {
      if (symbols.length > 0) {
        unsubscribe(symbols);
      }
    };
  }, [holdings, subscribe, unsubscribe]);

  const { totalValue, totalCost, dayChange } = useMemo(() => {
    let value = 0;
    let cost = 0;
    let change = 0;

    holdings.forEach((h) => {
      const livePrice = wsPrices[h.symbol] ?? h.currentPrice ?? h.purchasePrice;
      const holdingValue = h.shares * livePrice;
      const holdingCost = h.shares * h.purchasePrice;

      value += holdingValue;
      cost += holdingCost;

      // Day change: use the 'change' field if available (price change today),
      // otherwise fall back to difference between live price and currentPrice from API
      if (h.change !== undefined && h.change !== null) {
        change += h.change * h.shares;
      } else if (wsPrices[h.symbol] && h.currentPrice) {
        // Approximate: difference between WS live price and last API-fetched price
        change += (wsPrices[h.symbol] - h.currentPrice) * h.shares;
      }
    });

    return { totalValue: value, totalCost: cost, dayChange: change };
  }, [holdings, wsPrices]);

  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;
  const dayChangePercent = totalValue - dayChange > 0 ? (dayChange / (totalValue - dayChange)) * 100 : 0;

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