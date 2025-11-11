"use client";

import React from "react";
import HoldingsTable from "@/app/dashboard/components/HoldingsTable";
import PerformanceChart from "@/app/dashboard/components/PerformanceChart";
import SummaryCards from "./components/SummaryCards";
import AddHoldingForm from "./components/AddHoldingForm";
import { useHoldings } from "@/lib/hooks/useHoldings";

const DashboardPage: React.FC = () => {
  const { holdings, loading, addHolding, removeHolding } = useHoldings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-white mb-6">Dashboard</h1>
        <SummaryCards holdings={holdings} />
        <AddHoldingForm onAdd={addHolding} />
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
          <PerformanceChart />
        </div>
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <HoldingsTable holdings={holdings} onRemove={removeHolding} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;