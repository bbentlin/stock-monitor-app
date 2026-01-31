"use client";

import React from "react";
import { Holding } from "@/types";

interface ExportHoldingsProps {
  holdings: Holding[];
}

const ExportHoldings: React.FC<ExportHoldingsProps> = ({ holdings }) => {
  const exportToCSV = () => {
    if (holdings.length === 0) return;

    const headers = [
      "Symbol",
      "Shares",
      "Purchase Price",
      "Current Price",
      "Total Value",
      "Gain/Loss",
      "Gain/Loss %",
    ];

    const rows = holdings.map((holding) => {
      const totalValue = (holding.currentPrice || 0) * holding.shares;
      const costBasis = holding.purchasePrice * holding.shares;
      const gainLoss = totalValue - costBasis;
      const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      return [
        holding.symbol,
        holding.shares.toString(),
        holding.purchasePrice.toFixed(2),
        (holding.currentPrice || 0).toFixed(2),
        totalValue.toFixed(2),
        gainLoss.toFixed(2),
        gainLossPercent.toFixed(2) + "%",
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `portfolio-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={exportToCSV}
      disabled={holdings.length === 0}
      className="inline-flex items-center gap-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      Export CSV
    </button>
  );
};

export default ExportHoldings;