"use client";

import React from "react";
import { WatchlistStock } from "@/lib/hooks/useWatchlist";

interface WatchlistProps {
  stocks: WatchlistStock[];
  onRemove: (symbol: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ stocks, onRemove }) => {
  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-2xl font-bold text-white mb-4">Watchlist</h2>
      {stocks.length === 0 ? (
        <div className="text-gray-400 text-center py-8">
          Your watchlist is empty. Search for stocks and add them to your watchlist.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900 border border-gray-700">
            <thead>
              <tr className="bg-gray-800">
                <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Symbol</th>
                <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Name</th>
                <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Type</th>
                <th className="py-3 px-4 border-b border-gray-700 text-left text-gray-300">Region</th>
                <th className="py-3 px-4 border-b border-gray-700 text-center text-gray-300">Action</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((stock) => (
                <tr key={stock.symbol} className="hover:bg-gray-800">
                  <td className="py-3 px-4 border-b border-gray-700 text-white font-semibold">{stock.symbol}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-gray-300">{stock.name}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-gray-300">{stock.type}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-gray-300">{stock.region}</td>
                  <td className="py-3 px-4 border-b border-gray-700 text-center">
                    <button
                      onClick={() => onRemove(stock.symbol)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Watchlist;