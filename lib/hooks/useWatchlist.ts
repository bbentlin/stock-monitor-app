"use client";

import { useState, useEffect } from "react";

export interface WatchlistStock {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await fetch("/api/watchlist");
        const data = await response.json();
        setWatchlist(data.watchlist);
      } catch (error) {
        console.error("Error fetching watchlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchlist();
  }, []);

  const addToWatchlist = async (stock: WatchlistStock) => {
    try {
      const response = await fetch("/api/watchlist", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(stock)
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist([...watchlist, stock]);
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error);
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    try {
      const response = await fetch(`/api/watchlist?symbol=${symbol}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        setWatchlist(watchlist.filter(s => s.symbol !== symbol));
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error);
    }
  };

  return { watchlist, loading, addToWatchlist, removeFromWatchlist };
};