"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { Holding } from "@/lib/hooks/useHoldings";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface PerformanceChartProps {
  holdings: Holding[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ holdings }) => {
  const { portfolio, loading } = usePortfolio(holdings);

  if (loading) {
    return (
      <div className="text-gray-400 text-center py-8">
        Loading chart...
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        <p>No portfolio data available.</p>
        <p className="text-sm mt-2">Add holdings to see your portfolio performance.</p>
      </div>
    );
  }

  interface StockData {
    date: string;
    value: number;
  }

  const data = {
    labels: portfolio.map((stock: StockData) => stock.date),
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolio.map((stock: StockData) => stock.value),
        borderColor: "rgba(59, 130, 246, 1)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          color: "#9CA3AF",
        },
      },
      title: {
        display: true,
        text: "Portfolio Performance Over Time",
        color: "#F3F4F6",
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: { parsed: { y: number } }) {
            return `Value: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: "#9CA3AF",
        },
        grid: {
          color: "rgba(75, 85, 99, 0.2)",
        },
      },
      y: {
        ticks: {
          color: "#9CA3AF",
          callback: function(value: number | string) {
            return "$" + Number(value).toLocaleString();
          }
        },
        grid: {
          color: "rgba(75, 85, 99, 0.2)"
        },
      },
    },
  };

  return (
    <div style={{ height: "400px" }}>
      <Line options={options} data={data} />
    </div>
  );
};

export default PerformanceChart;