"use client";

import { useState, useEffect, useCallback } from "react";
import { Holding } from "@/types";

interface PortfolioDataPoint {
  date: string;
  value: number;
}

interface Snapshot {
  id: string;
  totalValue: number;
  totalCost: number;
  date: string;
}

export const usePortfolio = (holdings: Holding[]) => {
  const [portfolio, setPortfolio] = useState<PortfolioDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  // Calculate current portfolio values
  const currentValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.purchasePrice), 0);

  // Save snapshot when values change
  const saveSnapshot = useCallback(async () => {
    if (holdings.length === 0 || currentValue === 0) return;

    try {
      await fetch("/api/portfolio/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalValue: currentValue, totalCost }),
      });
    } catch (error) {
      console.error("Error saving portfolio snapshot:", error);
    }
  }, [currentValue, totalCost, holdings.length]);

  // Fetch historical data
  const fetchHistory = useCallback(async () => {
    if (holdings.length === 0) {
      setPortfolio([]);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/portfolio/history");
      
      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const data = await response.json();
      const snapshots: Snapshot[] = data.snapshots || [];

      if (snapshots.length > 0) {
        // Use real historical data
        const portfolioData: PortfolioDataPoint[] = snapshots.map((snapshot) => ({
          date: new Date(snapshot.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          value: snapshot.totalValue,
        }));

        // Add current value as the latest point if different from last snapshot
        const lastSnapshot = snapshots[snapshots.length - 1];
        const today = new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });

        if (portfolioData[portfolioData.length - 1]?.date !== today) {
          portfolioData.push({
            date: today,
            value: currentValue,
          });
        }

        setPortfolio(portfolioData);
      } else {
        // No history yet - show starting point and current
        const startDate = holdings.reduce((earliest, h) => {
          if (!h.purchaseDate) return earliest;
          const date = new Date(h.purchaseDate);
          return date < earliest ? date : earliest;
        }, new Date());

        setPortfolio([
          {
            date: startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: totalCost, // Started with cost basis
          },
          {
            date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            value: currentValue,
          },
        ]);
      }
    } catch (error) {
      console.error("Error fetching portfolio history:", error);
      // Fallback to simple two-point chart
      setPortfolio([
        { date: "Start", value: totalCost },
        { date: "Today", value: currentValue },
      ]);
    } finally {
      setLoading(false);
    }
  }, [holdings, currentValue, totalCost]);

  // Save snapshot when holdings change
  useEffect(() => {
    saveSnapshot();
  }, [saveSnapshot]);

  // Fetch history on mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { portfolio, loading };
};