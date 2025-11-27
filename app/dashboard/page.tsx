"use client";

import React from "react";
import HoldingsTable from "@/app/dashboard/components/HoldingsTable";
import PerformanceChart from "@/app/dashboard/components/PerformanceChart";
import SummaryCards from "./components/SummaryCards";
import AddHoldingForm from "./components/AddHoldingForm";
import { useHoldings } from "@/lib/hooks/useHoldings";

const DashboardPage: React.FC = () => {
  const { holdings, loading, error, addHolding, removeHolding } = useHoldings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading your portfolio...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  // Ensure holdings is always an array befor passing to components
  const safeHoldings = holdings || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Portfolio Dashboard</h1>

        <SummaryCards holdings={safeHoldings} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <PerformanceChart holdings={safeHoldings} />
            </div>
          </div>
          <div>
            <AddHoldingForm onAdd={addHolding} />
          </div>
        </div>

        <HoldingsTable holdings={safeHoldings} onRemove={removeHolding} />
      </div>
    </div>
  );
};

export default DashboardPage;