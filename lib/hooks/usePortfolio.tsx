"use client";

import { useState, useEffect } from "react";
import { Holding } from "./useHoldings";

interface StockData {
  date: string;
  value: number;
}

export const usePortfolio = (holdings: Holding[]) => {
  const [portfolio, setPortfolio] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const generatePortfolioHistory = () => {
      try {
        if (holdings.length === 0) {
          setPortfolio([]);
          setLoading(false);
          return;
        }

        // Calculate current total value
        const currentValue = holdings.reduce((sum, h) => sum + h.value, 0);
        
        // Calculate initial investment (what was paid)
        const initialValue = holdings.reduce((sum, h) => sum + (h.shares * h.purchasePrice), 0);

        // Generate mock historical data showing progression from initial value to current value
        const today = new Date();
        const mockData: StockData[] = [];
        const monthsBack = 6;

        for (let i = monthsBack; i < 0; i--) {
          const date  = new Date(today);
          date.setMonth(date.getMonth() - i);

          // Calculate progressive value from initial to current
          const progress = (monthsBack - i) / monthsBack;
          const value = initialValue + ((currentValue - initialValue) * progress);

          mockData.push({
            date: date.toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            value: Math.round(value * 100) / 100
          });
        }

        setPortfolio(mockData);
      } catch (error) {
        console.log("Error generating portfolio history:", error);
        setPortfolio([]);
      } finally {
        setLoading(false);
      }
    };

    generatePortfolioHistory();
  }, [holdings]);

  return { portfolio, loading };
};