"use client";

import { useState, useEffect } from "react";

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
}

export const useHoldings = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoldings = async () => {
      try {
        const response = await fetch("/api/holdings");
        const data = await response.json();
        setHoldings(data.holdings);
      } catch (error) {
        console.error("Error fetching holdings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  const addHolding = async (holding: Holding) => {
    try {
      const response = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holding)
      });
      const data = await response.json();
      if (data.success) {
        setHoldings([...holdings, holding]);
      }
    } catch (error) {
      console.error("Error adding holding:", error);
    }
  };

  const removeHolding = async (symbol: string) => {
    try {
      const response = await fetch(`/api/holdings?symbol=${symbol}`, {
        method: "DELETE"
      });
      const data = await response.json();
      if (data.success) {
        setHoldings(holdings.filter(h => h.symbol !== symbol));
      }
    } catch (error) {
      console.error("Error removing holding:", error);
    }
  };

  return { holdings, loading, addHolding, removeHolding };
};
