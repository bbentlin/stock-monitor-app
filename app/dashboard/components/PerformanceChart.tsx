"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { usePortfolio } from "@/lib/hooks/usePortfolio";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const PerformanceChart: React.FC = () => {
  const { portfolio } = usePortfolio();

  interface StockData {
    date: string;
    value: number;
  }

  interface ChartDataset {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }

  interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
  }

    const data: ChartData = {
      labels: portfolio.map((stock: StockData) => stock.date), // Assuming stock.date exists
      datasets: [
        {
          label: "Portfolio Performance",
          data: portfolio.map((stock: StockData) => stock.value), // Assuming stock.value exists
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          fill: true,
        },
      ],
    };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Stock Portfolio Performance",
      },
    },
  };

  return <Line options={options} data={data} />;
};

export default PerformanceChart;