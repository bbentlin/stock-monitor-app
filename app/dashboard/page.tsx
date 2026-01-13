"use client";

import React from "react";
import { useHoldings } from "@/lib/hooks/useHoldings";
import LoadingSpinner from "@/components/LoadingSpinner";
import SummaryCards from "./components/SummaryCards";
import HoldingsTable from "./components/HoldingsTable";
import AddHoldingForm from "./components/AddHoldingForm";
import PerformanceChart from "./components/PerformanceChart";
import DiversificationChart from "./components/DiversificationChart";
import PortfolioNews from "./components/PortfolioNews";
import PriceAlerts from "./components/PriceAlerts";
import ExportHoldings from "./components/ExportHoldings";
import Link from "next/link";

const DashboardPage: React.FC = () => {
  const { holdings, loading, error, isAuthenticated, addHolding, removeHolding } = useHoldings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your portfolio..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md text-center border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sign In Required</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Please sign in to access your portfolio dashboard.
          </p>
          <Link
            href="/auth/signin"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div>
          <h2>Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const safeHoldings = holdings || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Portfolio Dashboard</h1>
          <ExportHoldings holdings={safeHoldings} />
        </div>

        <SummaryCards holdings={safeHoldings} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <PerformanceChart holdings={safeHoldings} />
          <DiversificationChart holdings={safeHoldings} />
        </div>

        <div className="mt-6">
          <AddHoldingForm onAdd={addHolding} />
        </div>

        <div className="mt-6">
          <HoldingsTable holdings={safeHoldings} onRemove={removeHolding} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <PriceAlerts holdings={safeHoldings} />
          <PortfolioNews holdings={safeHoldings} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;