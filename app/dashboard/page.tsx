"use client";

import React from "react";
import HoldingsTable from "@/app/dashboard/components/HoldingsTable";
import PerformanceChart from "@/app/dashboard/components/PerformanceChart";
import { useHoldings } from "@/lib/hooks/useHoldings";

const DashboardPage: React.FC = () => {
  const { holdings, loading } = useHoldings();

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <PerformanceChart />
      <HoldingsTable holdings={holdings} />
    </div>
  );
};

export default DashboardPage;