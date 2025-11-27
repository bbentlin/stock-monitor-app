"use client";

import { useState, useEffect, useCallback } from "react";

export interface Holding {
  id?: string;
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  lotId: string;
  purchaseDate?: string;
}

export const useHoldings = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHoldings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/holdings");
      const data = await response.json();

      // Ensure we always set an array
      setHoldings(Array.isArray(data.holdings) ? data.holdings : []);
    } catch (err) {
      console.error("Error fetching holdings:", err);
      setError("Failed to fetch holdings");
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHoldings();
  }, []);

  const addHolding = async (holding: Omit<Holding, "id">) => {
    try {
      const response = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holding),
      });

      if (!response.ok) {
        throw new Error("Failed to add holding");
      }

      await fetchHoldings();
      return true;
    } catch (err) {
      console.error("Error adding holding:", err);
      return false;
    }
  };

  const removeHolding = async (lotId: string) => {
    try {
      const response = await fetch(`/api/holdings?lotId=${lotId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove holding");
      }

      await fetchHoldings();
      return true;
    } catch (err) {
      console.error("Error removing holding:", err);
      return false;
    }
  };

  return {
    holdings,
    loading,
    error, 
    addHolding,
    removeHolding,
    refreshHoldings: fetchHoldings,
  };
};