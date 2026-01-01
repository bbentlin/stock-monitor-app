"use client";

import React from "react";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import LoadingSpinner from "@/components/LoadingSpinner";
import StockScreener from "./components/StockScreener";
import Watchlist from "./components/Watchlist";

const StocksPage: React.FC = () => {
  const { watchlist, loading, error, isGuest, addToWatchlist, removeFromWatchlist, clearError } = useWatchlist();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading watchlist..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Stock Explorer</h1>

        {isGuest && (
          <div className="bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              You are browsing as a guest. Sign in to save your watchlist permanently.
            </p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-6 flex justify-between items-center">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={clearError}
              className="text-red-800 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StockScreener onAddToWatchlist={addToWatchlist} />
          <Watchlist stocks={watchlist} onRemove={removeFromWatchlist} />
        </div>
      </div>
    </div>
  );
};

export default StocksPage;