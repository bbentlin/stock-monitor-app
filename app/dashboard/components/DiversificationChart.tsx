"use client";

import React from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Holding } from "@/lib/hooks/useHoldings";

ChartJS.register(ArcElement, Tooltip, Legend);

interface DiversificationChartProps {
  holdings: Holding[];
}

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1",
];

const DiversificationChart: React.FC<DiversificationChartProps> = ({ holdings }) => {
  if (holdings.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        Add holdings to see portfolio diversification.
      </div>
    );
  }

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  const data = {
    labels: holdings.map(h => h.symbol),
    datasets: [
      {
        data: holdings.map(h => h.value),
        backgroundColor: COLORS.slice(0, holdings.length),
        borderColor: "#1F2937",
        borderWidth: 2,
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
          generateLabels: (chart: any) => {
            const dataset = chart.data.datasets[0];
            return chart.data.labels.map((label: string, i: number) => {
              const value = dataset.data[i];
              const percentage = ((value / totalValue) * 100).toFixed(1);
              return {
                text: `${label} (${percentage}%)`,
                fillStyle: dataset.backgroundColor[i],
                hidden: false,
                index: i,
              };
            });
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            const percentage = ((value / totalValue) * 100).toFixed(1);
            return `$${value.toFixed(2)} (${percentage})`;
          },
        },
      },
    },
  };

  return (
    <div style={{ height: "300px" }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default DiversificationChart;