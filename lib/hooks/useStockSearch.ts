"use client";

import { useState } from "react";

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

  const searchStocks = async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stock/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (response.ok) {
        setResults(data.results || []);
      } else {
        setError(data.error || "Failed to search stocks");
        setResults([]);
      }
    } catch (err) {
      console.error("Error searching stocks:", err);
      setError("Failed to search stocks");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, searchStocks };
};