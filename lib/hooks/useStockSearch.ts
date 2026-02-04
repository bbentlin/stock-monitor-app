"use client";

import { useCallback, useState, useRef } from "react";

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
}

export const useStockSearch = () => {
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const searchStocks = useCallback((query: string) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    if (query.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Debounce for 300ms
    debounceRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`, {
          signal: abortControllerRef.current.signal,
        });

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setError(null);
        } else {
          setError("Search failed");
          setResults([]);
        }
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Search failed");
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    }, 300);
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, loading, error, searchStocks, clearResults };
};