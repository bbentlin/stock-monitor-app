"use client";

import { useState, useEffect } from "react";

interface StockData {
  date: string;
  value: number;
}

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Replace with actual API call
    const fetchPortfolio = async () => {
      try {
        // Mock data for now
        const mockData: StockData[] = [
          { date: "2024-01", value: 10000 },
          { date: "2024-02", value: 10500 },
          { date: "2024-03", value: 11200 },
          { date: "2024-04", value: 10800 },
          { date: "2024-05", value: 12000 },
        ];

        setPortfolio(mockData);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  return { portfolio, loading };
};