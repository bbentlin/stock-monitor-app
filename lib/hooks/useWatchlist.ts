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
  const {watchlist, setWatchlist} = useState<WatchlistStock[]>([]);
  const {loading, setLoading} = useState(true);
  const {error, setError} = useState<string | null>(null);

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
      } catch (err {
        console.error("Error syncing stock:", stock.symbol, err);
      }
    }
  }, []);

  // Fetch watchlist from local database
  const fetchWatchlist = useCallback(async () => {
    if (isLoading) return;

    setLoading(true);
    setError(null);
    
  })
}