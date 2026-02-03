"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { WatchlistStock } from "@/lib/hooks/useWatchlist";
import { useWebSocket } from "@/lib/context/WebSocketContext";

interface WatchlistProps {
  stocks: WatchlistStock[];
  onRemove: (symbol: string) => void;
}

const Watchlist: React.FC<WatchlistProps> =  ({ stocks, onRemove }) => {
  const { prices: wsPrices, connected, subscribe, unsubscribe } = useWebSocket();

  // Subscribe to WebSocket - prices come from context (which handles caching)
  useEffect(() => {
    const symbols = stocks.map((s) => s.symbol);
    if (symbols.length > 0) {
      subscribe(symbols);
    }
    return () => {
      if (symbols.length > 0) {
        unsubscribe(symbols);
      }
    };
  }, [stocks, subscribe, unsubscribe]);

  // Use prices from context - no separate API calls
  const getCurrentPrice = (symbol: string): number | undefined => {
    return wsPrices[symbol];
  };

return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h2>
          <div
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-yellow-500"}`}
            title={connected ? "Live prices" : "Using cached prices"}
          />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {stocks.length} {stocks.length === 1 ? "stock" : "stocks"}
        </span>
      </div>

      {stocks.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          Your watchlist is empty. Search for stocks and add them to your watchlist.
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {stocks.map((stock) => {
            const livePrice = getCurrentPrice(stock.symbol);
            const hasPrice = livePrice !== undefined;

            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors"
              >
                <Link href={`/stocks/${stock.symbol}`} className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-900 dark:text-white font-semibold text-lg">
                        {stock.symbol}
                      </span>
                      <p className="text-gray-500 dark:text-gray-400 text-sm truncate max-w-[150px]">
                        {stock.name}
                      </p>
                    </div>
                    {hasPrice && (
                      <div className="text-right mr-4">
                        <p className="text-gray-900 dark:text-white font-semibold">
                          ${livePrice.toFixed(2)}
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => onRemove(stock.symbol)}
                  className="ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  Remove
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Watchlist;