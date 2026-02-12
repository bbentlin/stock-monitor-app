"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { WatchlistStock } from "@/lib/hooks/useWatchlist";
import { useWebSocket } from "@/lib/context/WebSocketContext";
import { formatCurrency, formatPercent } from "@/lib/utils/formatters";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface WatchlistProps {
  stocks: WatchlistStock[];
  onRemove: (symbol: string) => void;
}

interface StockQuoteData {
  currentPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
}

const Watchlist: React.FC<WatchlistProps> = ({ stocks, onRemove }) => {
  const { prices: wsPrices, connected, subscribe, unsubscribe } = useWebSocket();
  const [showPercent, setShowPercent] = useState(false);
  const [quoteData, setQuoteData] = useState<Record<string, StockQuoteData>>({});

  // Subscribe to WebSocket
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

  // Fetch full quote data (price + change) for each stock
  useEffect(() => {
    const fetchQuotes = async () => {
      const symbols = stocks.map((s) => s.symbol);
      if (symbols.length === 0) return;

      try {
        const results = await Promise.allSettled(
          symbols.map(async (symbol) => {
            const res = await fetch(`/api/stock/quote?symbol=${symbol}`);
            if (!res.ok) return null;
            const data = await res.json();
            return { symbol, data };
          })
        );

        const newQuoteData: Record<string, StockQuoteData> = {};
        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value) {
            const { symbol, data } = result.value;
            newQuoteData[symbol] = {
              currentPrice: data.currentPrice,
              change: data.change,
              changePercent: data.changePercent,
              previousClose: data.previousClose,
            };
          }
        });

        setQuoteData((prev) => ({ ...prev, ...newQuoteData }));
      } catch (err) {
        console.error("Failed to fetch watchlist quotes", err);
      }
    };

    fetchQuotes();
    // Refresh every 60 seconds
    const interval = setInterval(fetchQuotes, 60000);
    return () => clearInterval(interval);
  }, [stocks]);

  const getDisplayData = (symbol: string) => {
    const wsPrice = wsPrices[symbol];
    const quote = quoteData[symbol];

    if (wsPrice && quote) {
      // Use live WS price but calculate change from previousClose
      const change = wsPrice - quote.previousClose;
      const changePercent = quote.previousClose > 0 ? (change / quote.previousClose) * 100 : 0;
      return { price: wsPrice, change, changePercent };
    }

    if (quote) {
      return { price: quote.currentPrice, change: quote.change, changePercent: quote.changePercent };
    }

    if (wsPrice) {
      return { price: wsPrice, change: null, changePercent: null };
    }

    return null;
  };

  return(
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h2>
          <div 
            className={`w-2 h-2 rounded-full ${connected ? "bg-green-500" : "bg-yellow-500"}`}
            title={connected ? "Live prices" : "Using cached prices"}
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle: Price vs Percent */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
            <button
              onClick={() => setShowPercent(false)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                !showPercent
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              aria-label="Show price change"
            >
              $
            </button>
            <button
              onClick={() => setShowPercent(true)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                showPercent
                  ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
              aria-label="Show percent change"
            >
              %
            </button>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {stocks.length} {stocks.length === 1 ? "stock" : "stocks"}
          </span>
        </div>
      </div>

      {stocks.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8">
          Your watchlist is empty. Search for stocks and add them to your watchlist.
        </div>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {stocks.map((stock) => {
            const displayData = getDisplayData(stock.symbol);
            const hasPrice = displayData !== null;
            const hasChange = displayData?.change !== null && displayData?.change !== undefined;
            const isPositive = hasChange && (displayData?.change ?? 0) >= 0;
            const isNeutral = hasChange && displayData?.change === 0;

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
                    {hasPrice && displayData && (
                      <div className="text-right mr-4">
                        <p className="text-gray-900 dark:text-white font-semibold">
                          {formatCurrency(displayData.price)}
                        </p>
                        {hasChange ? (
                          <div className="flex items-center justify-end gap-1">
                            {isNeutral ? (
                              <Minus className="h-3 w-3 text-gray-400" />
                            ) : isPositive ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" /> 
                            )}
                            <span
                              className={`text-sm font-medium ${
                                isNeutral
                                  ? "text-gray-400"
                                  : isPositive
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {showPercent
                                ? formatPercent(displayData.changePercent ?? 0)
                                : formatCurrency(displayData.change ?? 0)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-gray-400 dark:text-gray-500 text-xs">
                            No change data
                          </p>
                        )}
                      </div>
                    )}
                    {!hasPrice && (
                      <div className="text-right mr-4">
                        <p className="text-gray-400 dark:text-gray-500 text-sm">
                          Loading...
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => onRemove(stock.symbol)}
                  className="ml-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                  aria-label={`Remove ${stock.symbol} from watchlist`}
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