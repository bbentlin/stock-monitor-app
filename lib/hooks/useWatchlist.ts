"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

export interface WatchlistStock {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

const LOCAL_STORAGE_KEY = "guest_watchlist";

export const useWatchlist = () => {
  const { data: session, status } = useSession();
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated" && !session?.user?.id;
  const isLoading = status === "loading";

  // Get watchlist from localStorage
  const getLocalWatchlist = useCallback((): WatchlistStock[] => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  // Save watchlist to localStorage
  const saveLocalWatchlist = useCallback((stocks: WatchlistStock[]) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stocks));
    } catch (err) {
      console.error("Error saving to local storage:", err);
    }
  }, []);

  // Clear local watchlist
  const clearLocalWatchlist = useCallback(() => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  // Sync local watchlist to database
  const syncToDatabase = useCallback(async(localStocks: WatchlistStock[]) => {
    for (const stock of localStocks) {
      try {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stock),
        });
      } catch (err) {
        console.error("Error syncing stock:", stock.symbol, err);
      }
    }
  }, []);

  // Fetch watchlist based on auth status
  const fetchWatchlist = useCallback(async () => {
    if (isLoading) return;

    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated) {
        // Check for local watchlist to sync
        const localStocks = getLocalWatchlist();
        if (localStocks.length > 0) {
          await syncToDatabase(localStocks);
          clearLocalWatchlist();
        }

        // Fetch from database
        const response = await fetch("/api/watchlist");
        const data = await response.json();
        setWatchlist(data.watchlist || []);
      } else {
        // Use localStorage for guests
        setWatchlist(getLocalWatchlist());
      }
    } catch (err) {
      console.error("Error fetching watchlist:", err);
      setError("Failed to load watchlist");
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isLoading, getLocalWatchlist, syncToDatabase,clearLocalWatchlist]);
  
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const addToWatchlist = async (stock: WatchlistStock) => {
    setError(null);

    // Check if already in watchlist
    if (watchlist.some((s) => s.symbol === stock.symbol)) {
      setError("Already in watchlist");
      return false;
    }

    try {
      if (isAuthenticated) {
        // Add to database
        const response = await fetch ("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stock),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Failed to add to watchlist");
          return false;
        }
      } else {
        // Add to local storage for guests
        const updated = [...watchlist, stock];
        saveLocalWatchlist(updated);
      }

      setWatchlist([...watchlist, stock]);
      return true;
    } catch (err) {
      console.error("Error adding to watchlist:", err);
      setError("Failed to add to watchlist");
      return false;
    }
  };

  const removeFromWatchlist = async (symbol: string) => {
    setError(null);

    try {
      if (isAuthenticated) {
        // Remove from database
        const response = await fetch(`/api/watchlist?symbol=${symbol}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          setError("Failed to remove from watchlist");
          return false;
        }
      } else {
        // Remove from localStorage
        const updated = watchlist.filter((s) => s.symbol !== symbol);
      }

      setWatchlist(watchlist.filter((s) => s.symbol !== symbol));
      return true;
    } catch (err) {
      console.error("Error removing from watchlist:", err);
      setError("Failed to remove from watchlist");
      return false;
    }
  };

  const clearError = () => setError(null);

  return {
    watchlist,
    loading: loading || isLoading,
    error, 
    isGuest: !isAuthenticated,
    addToWatchlist,
    removeFromWatchlist,
    clearError,
  };
};