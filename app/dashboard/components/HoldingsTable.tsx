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
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 sm:p-12 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">Holdings</h2>
        <p className="text-gray-400 text-base sm:text-lg">No holdings yet</p>
        <p className="text-gray-500 text-sm mt-2">Add a stock above to start tracking your portfolio</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-700 gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Holdings</h2>
        <div>
          {error && (
            <span>{error}</span>
          )}
          {lastUpdated && (
            <span>
              Updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button>
            {loading ? (
              <>
                <svg>
                  <circle />
                  <path />
                </svg>
                Updating...
              </>
            ) : (
              <>
                <svg>
                  <path />
                </svg>
                Refresh
              </>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div>
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th>Shares</th>
              <th>Purchase</th>
              <th>Date</th>
              <th>
                Current 
                {loading && <span>●</span>}
              </th>
              <th>Value</th>
              <th>Gain/Loss</th>
              <th>Action</th>
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
                <tr>
                  <td>{holding.symbol}</td>
                  <td>{holding.name}</td>
                  <td>{holding.shares}</td>
                  <td>{holding.purchasePrice.toFixed(2)}</td>
                  <td>{formatDate(holding.purchaseDate)}</td>
                  <td>
                    <span>
                      ${currentPrice.toFixed(2)}
                    </span>
                    {hasLivePrice && (
                      <span>●</span>
                    )}
                  </td>
                  <td>${value.toFixed(2)}</td>
                  <td>
                    {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)} ({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%)
                  </td>
                  <td>
                    <button>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div>
        {liveHoldings.map((holding) => {
          const currentPrice = holding.livePrice ?? holding.currentPrice;
          const value = holding.liveValue ?? holding.value;
          const gainLoss = holding.liveGainLoss ?? holding.gainLoss;
          const gainLossPercent = holding.liveGainLossPercent ?? holding.gainLossPercent;
          const hasLivePrice = holding.livePrice !== undefined;

          return (
            <div>
              {/* Card Header */}
              <div>
                <div>
                  <div>
                    <span>{holding.symbol}</span>
                    {hasLivePrice && <span>●</span>}
                  </div>
                  <span>{holding.name}</span>
                </div>
                <button>
                  Remove
                </button>
              </div>

              {/* Card Body */}
              <div>
                <div>
                  <span>Shares</span>
                  <span>{holding.shares}</span>
                </div>
                <div>
                  <span>Purchase Price</span>
                  <span>{holding.purchasePrice.toFixed(2)}</span>
                </div>
                <div>
                  <span>Purchase Date</span>
                  <span>{formatDate(holding.purchaseDate)}</span>
                </div>
                <div>
                  <span>Current Price</span>
                  <span>
                    ${currentPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div>
                <div>
                  <span>Total Value</span>
                  <span>${value.toFixed(2)}</span>
                </div>
                <div>
                  <span>Gain/Loss</span>
                  <span>
                    {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)} ({gainLossPercent >= 0 ? "+" : ""}{gainLossPercent.toFixed(2)}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div>
        <span>●</span> Live price
        <span>|</span>
        Prices auto-refresh every 60 seconds
      </div>
    </div>
  );
};

export default HoldingsTable;