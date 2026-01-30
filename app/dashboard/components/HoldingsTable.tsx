"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Holding } from "@/types";
import { useWebSocket } from "@/lib/context/WebSocketContext";
import { usePriceFlash } from "@/lib/hooks/usePriceFlash";
import ConfirmModal from "@/components/ConfirmModal";

interface HoldingsTableProps {
  holdings: Holding[];
  onRemove: (lotId: string) => void;
}

type SortField = "symbol" | "shares" | "value" | "gainLoss" | "gainLossPercent";
type SortDirection = "asc" | "desc";

const HoldingsTable: React.FC<HoldingsTableProps> = ({ holdings, onRemove }) => {
  const { prices: wsPrices, connected, subscribe, unsubscribe } = useWebSocket();
  const flashes = usePriceFlash(wsPrices);
  const [deleteTarget, setDeleteTarget] = useState<{ lotId: string; symbol: string } | null>(null);

  const [sortField, setSortField] = useState<SortField>("symbol");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => {
      const aPrice = wsPrices[a.symbol] ?? a.currentPrice;
      const bPrice = wsPrices[b.symbol] ?? b.currentPrice;
      const aValue = a.shares * aPrice;
      const bValue = b.shares * bPrice;
      const aCost = a.shares * a.purchasePrice;
      const bCost = b.shares * b.purchasePrice;
      const aGainLoss = aValue - aCost;
      const bGainLoss = bValue - bCost;
      const aPercent = aCost > 0 ? (aGainLoss / aCost) * 100 : 0;
      const bPercent = bCost > 0 ? (bGainLoss / bCost) * 100 : 0;

      let comparison = 0;
      switch (sortField) {
        case "symbol":
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case "shares": 
          comparison = a.shares - b.shares;
          break;
        case "value": 
          comparison = aValue - bValue;
          break;
        case "gainLoss":
          comparison = aGainLoss - bGainLoss;
          break;
        case "gainLossPercent":
          comparison = aPercent - bPercent;
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [holdings, wsPrices, sortField, sortDirection]);

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

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onRemove(deleteTarget.lotId);
      setDeleteTarget(null);
    }
  };

  const SortHeader: React.FC<{ field: SortField; label: string; align?: "left" | "right"}> = ({
    field,
    label,
    align = "right",
  }) => (
    <th
      className={`px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
        align === "left" ? "text-left" : "text-right"
      }`}
      onClick={() => handleSort(field)}
    >
      <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
        {label}
        {sortField === field && (
          <span className="text-blue-500">
            {sortDirection === "asc" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </th>
  );

  if (holdings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          No holdings yet. Add your first stock above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              Holdings
            </h2>
            <div
              className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-yellow-500"}`}
              title={connected ? "Live prices" : "Connecting..."}
            />
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {holdings.length} {holdings.length === 1 ? "position" : "positions"}
          </span>
        </div>

        {/* Mobile Card View */}
        <div className="block sm:hidden divide-y divide-gray-200 dark:divide-gray-700">
          {sortedHoldings.map((holding) => {
            const livePrice = wsPrices[holding.symbol] ?? holding.currentPrice;
            const isLive = wsPrices[holding.symbol] !== undefined;
            const flash = flashes[holding.symbol];
            const liveValue = holding.shares * livePrice;
            const costBasis = holding.shares * holding.purchasePrice;
            const liveGainLoss = liveValue - costBasis;
            const liveGainLossPercent = costBasis > 0 ? (liveGainLoss / costBasis) * 100 : 0;

            return (
              <div key={holding.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white text-lg">
                        {holding.symbol}
                      </span>
                      {isLive && <span className="text-green-500 text-xs">●</span>}
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {holding.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteTarget({ lotId: holding.lotId, symbol: holding.symbol })}
                    className="text-red-500 hover:text-red-700 p-2 -mr-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Shares</span>
                    <p className="font-medium text-gray-900 dark:text-white">{holding.shares}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Avg Cost</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(holding.purchasePrice)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Price</span>
                    <p
                      className={`font-medium transition-colors duration-300 ${
                        flash === "up"
                          ? "text-green-500"
                          : flash === "down"
                          ? "text-red-500"
                          : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {formatCurrency(livePrice)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Value</span>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(liveValue)}
                    </p>
                  </div>
                </div>

                <div
                  className={`mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 ${
                    liveGainLoss >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Gain/Loss</span>
                    <div className="text-right">
                      <span className="font-semibold">{formatCurrency(liveGainLoss)}</span>
                      <span className="ml-2 text-sm">({formatPercent(liveGainLossPercent)})</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <SortHeader field="symbol" label="Symbol" align="left" />
                <SortHeader field="shares" label="Shares" />
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Avg Cost
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Price
                </th>
                <SortHeader field="value" label="Value" />
                <SortHeader field="gainLoss" label="Gain/Loss" />
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sortedHoldings.map((holding) => {
                const livePrice = wsPrices[holding.symbol] ?? holding.currentPrice;
                const isLive = wsPrices[holding.symbol] !== undefined;
                const flash = flashes[holding.symbol];
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
                      <div className={liveGainLoss >= 0 ? "text-green-500" : "text-red-500"}>
                        <div>{formatCurrency(liveGainLoss)}</div>
                        <div className="text-sm">{formatPercent(liveGainLossPercent)}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/stocks/${holding.symbol}`}
                          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-sm font-medium transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() =>
                            setDeleteTarget({ lotId: holding.lotId, symbol: holding.symbol })
                          }
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-medium transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Remove Holding"
        message={`Are you sure you want to remove ${deleteTarget?.symbol} from your portfolio?`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default HoldingsTable;