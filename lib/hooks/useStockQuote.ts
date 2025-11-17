"use client";

import { useState } from "react";

export interface StockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
}

export const useStockQuote = () => {
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async (symbol: string) => {
    if (!symbol) {
      setQuote(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/stock/quote?symbol=${encodeURIComponent(symbol)}`);
      const data = await response.json();

      if (response.ok) {
        setQuote(data);
      } else {
        setError(data.error || "Failed to fetch quote");
        setQuote(null);
      }
    } catch (err) {
      console.error("Error fetching quote:", err);
      setError("Failed to fetch quote");
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  return { quote, loading, error, fetchQuote };
};