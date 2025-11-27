"use client";

import { useCallback, useState } from "react";

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

export const useStockSearch = () => {
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce timer ref
  const debounceTimerRef = useState<NodeJS.Timeout | null>(null);

  const searchStocks = useCallback(async (query: string, immediate: boolean = false) => {
    if (!query || query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    // Clear existing timer
    if (debounceTimerRef[0]) {
      clearTimeout(debounceTimerRef[0]);
    }

    // Set loading state immediately
    setLoading(true);
    setError(null);

    const executeSearch = async () => {
      try {
        const response = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (response.ok) {
          setResults(data.results || []);
        } else {
          setError(data.error || "Search failed");
          setResults([]);
        }
      } catch (err) {
        setError("Failed to search stocks");
        setResults([]);
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (immediate) {
      executeSearch();
    } else {
      // Debounce: wait 500ms after user stops typing
      const timer = setTimeout(executeSearch, 500);
      debounceTimerRef[0] = timer;
    }
  }, []);

  return { results, loading, error, searchStocks };
};