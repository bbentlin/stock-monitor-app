"use client";

import React from "react";
import { useHoldings } from "@/lib/hooks/useHoldings";
import LoadingSpinner from "@/components/LoadingSpinner";
import SectionErrorBoundary from "@/components/SectionErrorBoundary";
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
  const { holdings, loading, error, isAuthenticated, addHolding, updateHolding, removeHolding } = useHoldings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-md w-full text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base">
            Please sign in to view your portfolio dashboard.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors w-full sm:w-auto"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
        <div className="bg-red-100 dark:bg-red-900/30 p-4 sm:p-6 rounded-lg border border-red-300 dark:border-red-700">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-200">Error</h2>
          <p className="text-red-700 dark:text-red-300 text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  const safeHoldings = holdings || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Portfolio Dashboard
          </h1>
          <ExportHoldings holdings={safeHoldings} />
        </div>

        {/* Summary Cards */}
        <SectionErrorBoundary sectionName="Summary">
          <SummaryCards holdings={safeHoldings} />
        </SectionErrorBoundary>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <SectionErrorBoundary sectionName="Performance/Diversification Charts">
            <PerformanceChart holdings={safeHoldings} />
            <DiversificationChart holdings={safeHoldings} />
          </SectionErrorBoundary>
        </div>

        {/* Add Holding Form */}
        <div className="mt-4 sm:mt-6">
          <SectionErrorBoundary sectionName="Add Holding">
            <AddHoldingForm onAddHolding={addHolding} />
          </SectionErrorBoundary>
        </div>

        {/* Holdings Table */}
        <div className="mt-4 sm:mt-6">
          <SectionErrorBoundary sectionName="Holdings">
            <HoldingsTable
            holdings={safeHoldings}
            onRemove={removeHolding}
            onUpdate={updateHolding}
            />
          </SectionErrorBoundary>
        </div>

        {/* Alerts and News */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          <SectionErrorBoundary sectionName="Price Alerts & News">
            <PriceAlerts holdings={safeHoldings} />
            <PortfolioNews holdings={safeHoldings} />
          </SectionErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;