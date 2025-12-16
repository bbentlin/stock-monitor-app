"use client";

import { useState, useEffect, useCallback } from "react";
import { Holding } from "./useHoldings";

interface LivePriceData {
  currentPrice: number;
  change: number;
  changePercent: number;
}

interface LiveHolding extends Holding {
  livePrice?: number;
  liveValue?: number;
  liveGainLoss?: number;
  liveGainLossPercent?: number;
}

export const useLivePrices = (holdings: Holding[]) => {
  const [prices, setPrices] = useState<Record<string, LivePriceData>>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = useCallback(async () => {
    if (holdings.length === 0) {
      setPrices({});
      return;
    }

    // Get unique symbols
    const symbols = Array.from(new Set(holdings.map((h) => h.symbol.toUpperCase())));

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/stock/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symbols }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prices");
      }

      const data = await response.json();
      setPrices(data.quotes || {});
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching live prices:", err);
      setError("Failed to fetch live prices");
    } finally {
      setLoading(false);
    }
  }, [holdings]);

  // Initial fetch
  useEffect(() => {
    fetchPrices();
  }, [fetchPrices]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    if (holdings.length === 0) return;

    const interval = setInterval(fetchPrices, 60000);
    return () => clearInterval(interval);
  }, [holdings, fetchPrices]);

  // Calculate live holdings with updated prices
  const liveHoldings: LiveHolding[] = holdings.map((holding) => {
    const priceData = prices[holding.symbol.toUpperCase()];

    if (!priceData) {
      return holding;
    }

    const livePrice = priceData.currentPrice;
    const liveValue = holding.shares * livePrice;
    const costBasis = holding.shares * holding.purchasePrice;
    const liveGainLoss = liveValue - costBasis;
    const liveGainLossPercent = costBasis > 0 ? (liveGainLoss / costBasis) * 100 : 0;

    return {
      ...holding,
      livePrice,
      liveValue,
      liveGainLoss,
      liveGainLossPercent,
    };
  });

  // Calculate live totals
  const liveTotalValue = liveHoldings.reduce(
    (sum, h) => sum + (h.liveValue ?? h.value),
    0
  );
  const liveTotalGainLoss = liveHoldings.reduce(
    (sum, h) => sum + (h.liveGainLoss ?? h.gainLoss),
    0
  );

  return {
    liveHoldings,
    liveTotalValue,
    liveTotalGainLoss,
    loading,
    lastUpdated,
    error,
    refresh: fetchPrices,
  };
};