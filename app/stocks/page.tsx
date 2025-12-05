"use client";
import Link from "next/link";
import React from "react";
import StockScreener from "@/app/stocks/components/StockScreener";
import Watchlist from "@/app/stocks/components/Watchlist";
import { useWatchlist } from "@/lib/hooks/useWatchlist";

const StocksPage: React.FC = () => {
  const { watchlist, loading, error, isGuest, addToWatchlist, removeFromWatchlist, clearError } = useWatchlist();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Stock Selection</h1>

        {isGuest && (
          <div className="bg-blue-500/20 border border-blue-500 text-blue-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>
              Your watchlist is saved locally.
              <Link href="/auth/signin" className="underline ml-1 hover:text-blue-300">
                Sign In
              </Link>
              {" "}to sync across devices.
            </span>
          </div>
        )}

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-red-300">x</button>
          </div>
        )}

        <StockScreener onAddToWatchlist={addToWatchlist} />
        <Watchlist stocks={watchlist} onRemove={removeFromWatchlist} /> 
      </div>
    </div>
  );
};

export default StocksPage;