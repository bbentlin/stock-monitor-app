"use client";

import React, { useState } from "react";
import { useStockSearch } from "@/lib/hooks/useStockSearch";
import { WatchlistStock } from "@/lib/hooks/useWatchlist";

interface StockScreenerProps {
  onAddToWatchlist: (stock: WatchlistStock) => void;
}

const StockScreener: React.FC<StockScreenerProps> = ({ onAddToWatchlist }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { results, loading, error, searchStocks } = useStockSearch();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    if (value.length >= 2) {
      searchStocks(value);
    }
  };

  const handleAddToWatchlist = (stock: any) => {
    onAddToWatchlist({
      symbol: stock.symbol,
      name: stock.name,
      type: stock.type,
      region: stock.region
    });
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Stock Screener</h2>

      <div className="mb-6">
        <input 
          type="text"
          placeholder="Search stocks by symbol or name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {loading && (
        <div className="text-gray-400 text-center py-4">Searching...</div>
      )}

      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Symbol</th>
                <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Name</th>
                <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Type</th>
                <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Region</th>
                <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {results.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-800">
                  <td className="py-3 px-4 border-b border-gray-700 text-white font-semibold">{stock.symbol}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-gray-300">{stock.name}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-gray-300">{stock.type}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-gray-300">{stock.region}</td>
                  <td className="py-3 px-4 border-b border-gray-700">
                    <button 
                      onClick={() => handleAddToWatchlist(stock)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      Add to Watchlist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && searchTerm.length >= 2 && results.length === 0 && (
        <div className="text-gray-400 text-center py-4">No results found</div>
      )}
    </div>
  );
};

export default StockScreener;