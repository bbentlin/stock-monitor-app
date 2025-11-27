"use client";

import React from "react";
import StockScreener from "@/app/stocks/components/StockScreener";
import Watchlist from "@/app/stocks/components/Watchlist";
import { useWatchlist } from "@/lib/hooks/useWatchlist";

const StocksPage: React.FC = () => {
  const { watchlist, loading, addToWatchlist, removeFromWatchlist } = useWatchlist();

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
        <StockScreener onAddToWatchlist={addToWatchlist} />
        <Watchlist stocks={watchlist} onRemove={removeFromWatchlist} />
      </div>
    </div>
  );
};

export default StocksPage;