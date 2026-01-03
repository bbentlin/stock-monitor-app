"use client";

import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Holding } from "@/types";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DiversificationChartProps {
  holdings: Holding[];
}

const COLORS = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#84CC16",
  "#F97316",
  "#6366F1",
];

const DiversificationChart: React.FC<DiversificationChartProps> = ({ holdings }) => {
  if (holdings.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Diversification</h2>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500 dark:text-gray-400">No holdings to display</p>
        </div>
      </div>
    );
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  const data = {
    labels: holdings.map((h) => h.symbol),
    datasets: [
      {
        data: holdings.map((h) => h.value),
        backgroundColor: COLORS.slice(0, holdings.length),
        borderColor: "transparent",
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right" as const,
        labels: {
          color: "#9CA3AF",
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / totalValue) * 100).toFixed(1);
            return `$${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    cutout: "60%",
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Diversification</h2>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};

export default DiversificationChart;