"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { WatchlistStock } from "@/lib/hooks/useWatchlist";

interface WatchlistProps {
  stocks: WatchlistStock[];
  onRemove: (symbol: string) => void;
}

interface StockPrice {
  currentPrice: number;
  change: number;
  changePercent: number;
}

const Watchlist: React.FC<WatchlistProps> = ({ stocks, onRemove }) => {
  const [prices, setPrices] = useState<Record<string, StockPrice>>({});
  const [loadingPrices, setLoadingPrices] = useState(false);

  useEffect(() => {
    const fetchPrices = async () => {
      if (stocks.length === 0) return;

      setLoadingPrices(true);
      const newPrices: Record<string, StockPrice> = {};

      // Fetch prices for all stocks (with rate limiting)
      for (const stock of stocks) {
        try {
          const response = await fetch(`/api/stock/quote?symbol=${stock.symbol}`);
          if (response.ok) {
            const data = await response.json();
            newPrices[stock.symbol] = {
              currentPrice: data.currentPrice,
              change: data.change,
              changePercent: data.changePercent,
            };
          }
        } catch (err) {
          console.error(`Error fetching price for ${stock.symbol}`, err);
        }
        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
      }

      setPrices(newPrices);
      setLoadingPrices(false);
    };

    fetchPrices();

    // Refresh prices every 60 seconds
    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [stocks]);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Watchlist</h2>
        {loadingPrices && (
          <span className="text-gray-500 dark:text-gray-400 text-sm">Updating prices...</span>
        )}
      </div>

      {stocks.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400 text-center py-8"> 
          Your watchlist is empty. Search for stocks and add them to your watchlist.
        </div>
      ) : (
        <div className="space-y-2">
          {stocks.map((stock) => {
            const price = prices[stock.symbol];
            return (
              <div
                key={stock.symbol}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                <Link href={`/stocks/${stock.symbol}`} className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-900 dark:text-white font-semibold text-lg">{stock.symbol}</span>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{stock.name}</p>
                    </div>
                    {price && (
                      <div className="text-right mr-4">
                        <p className="text-gray-900 dark:text-white font-semibold">${price.currentPrice.toFixed(2)}</p>
                        <p className={`text-sm ${price.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {price.change >= 0 ? "+" : ""}{price.change?.toFixed(2)} ({price.changePercent?.toFixed(2)}%)
                        </p>
                      </div>
                    )}
                  </div>
                </Link>
                <button
                  onClick={() => onRemove(stock.symbol)}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors ml-2"
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