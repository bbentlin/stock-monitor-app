"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from "chart.js";
import { usePortfolio } from "@/lib/hooks/usePortfolio";
import { Holding } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { callback } from "chart.js/dist/helpers/helpers.core";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

interface PerformanceChartProps {
  holdings: Holding[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ holdings }) => {
  const { portfolio, loading } = usePortfolio(holdings);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 flex items-center justify-center h-80">
        <LoadingSpinner text="Loading chart..." />
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Performance</h2>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No data available yet</p>
        </div>
      </div>
    );
  }

  const data = {
    labels: portfolio.map((p) => p.date),
    datasets: [
      {
        label: "Portfolio Value",
        data: portfolio.map((p) => p.value),
        borderColor: "#3B82F6",
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
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "#9CA3AF",
        },
      },
      y: {
        grid: {
          color: "rgba(156, 163, 175, 0.2)",
        },
        ticks: {
          color: "#9CA3AF",
          callback: (value: number) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Performance</h2>
      <div className="h-64">
        <Line data={data} options={options as any} />
      </div>
    </div>
  );
};

export default PerformanceChart;