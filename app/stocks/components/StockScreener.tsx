"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStockSearch } from "@/lib/hooks/useStockSearch";
import { WatchlistStock } from "@/lib/hooks/useWatchlist";

interface StockScreenerProps {
  onAddToWatchlist: (stock: WatchlistStock) => Promise<boolean>;
}

const StockScreener: React.FC<StockScreenerProps> = ({ onAddToWatchlist }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [addedSymbols, setAddedSymbols] = useState<Set<string>>(new Set());
  const { results, loading, error, searchStocks } = useStockSearch();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    searchStocks(value);
  };

  const handleAddToWatchlist = async (e: React.MouseEvent, stock: any) => {
    e.preventDefault(); // Prevent navigation when clicking the button
    e.stopPropagation();
    
    const watchlistStock: WatchlistStock = {
      symbol: stock.symbol,
      name: stock.description || stock.name,
      type: stock.type || "Unknown",
      region: stock.region || "US",
    };

    const success = await onAddToWatchlist(watchlistStock);
    if (success) {
      setAddedSymbols((prev) => new Set(prev).add(stock.symbol));
      // Remove the "Added" indicator after 2 seconds
      setTimeout(() => {
        setAddedSymbols((prev) => {
          const next = new Set(prev);
          next.delete(stock.symbol);
          return next;
        });
      }, 2000);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Stock Screener</h2>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search for stocks (e.g., Apple, Tesla, Nvidia)"
        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 mb-4"
      />

      {loading && (
        <div className="text-gray-400 text-center py-4">Searching...</div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}

      {results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {results.map((stock) => (
            <Link
              key={stock.symbol}
              href={`/stocks/${stock.symbol}`}
              className="flex items-center justify-between p-4 bg-gray-900 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <div>
                <div className="text-white font-semibold text-lg">{stock.symbol}</div>
                <div className="text-gray-400 text-sm">{stock.name}</div>
                <div className="text-gray-500 text-xs">{stock.type}</div>
              </div>
              <div className="flex items-center gap-2">
                {addedSymbols.has(stock.symbol) ? (
                  <span className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                    ✓ Added
                  </span>
                ) : (
                  <button
                    onClick={(e) => handleAddToWatchlist(e, stock)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                  >
                    + Watchlist
                  </button>
                )}
                <span className="text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {searchTerm.length >= 2 && !loading && results.length === 0 && !error && (
        <div className="text-gray-400 text-center py-8">
          No results found for "{searchTerm}"
        </div>
      )}

      {searchTerm.length === 0 && (
        <div className="text-gray-500 text-center py-8">
          Start typing to search for stocks
        </div>
      )}
    </div>
  );
};

export default StockScreener;