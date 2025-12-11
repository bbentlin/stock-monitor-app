"use client";

import { useCallback, useState, useRef } from "react";

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

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const searchStocks = useCallback(async (query: string, immediate: boolean = false) => {
    if (!query || query.length < 2) {
      setResults([]);
      setError(null);
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
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
      debounceTimerRef.current = setTimeout(executeSearch, 500);
    }
  }, []);

  return { results, loading, error, searchStocks };
};