"use client";

import React from "react";
import Link from "next/link";
import DiversificationChart from "./components/DiversificationChart";
import HoldingsTable from "@/app/dashboard/components/HoldingsTable";
import PerformanceChart from "@/app/dashboard/components/PerformanceChart";
import SummaryCards from "./components/SummaryCards";
import AddHoldingForm from "./components/AddHoldingForm";
import { useHoldings } from "@/lib/hooks/useHoldings";

const DashboardPage: React.FC = () => {
  const { holdings, loading, error, isAuthenticated, addHolding, removeHolding }  = useHoldings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading your profile...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg border border-gray-700 max-w-md text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 mx-auto text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
          <p className="text-gray-400 mb-6">
            Please sign in to view and manage your portfolio holdings.
          </p>
          <div className="space-y-3">
            <Link
              href="/auth/signin"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="block w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Create Account
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            Want to explore first?{" "}
            <Link 
              href="/stocks"
              className="text-blue-500 hover:text-blue-400"
            >
              Browse stocks
            </Link>
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <div className="bg-gray-800 p-8 rounded-lg border border-red-500 max-w-md text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Try Again
          </button>
        </div>
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
            <PerformanceChart holdings={safeHoldings} />
          </div>
          <div>
            <DiversificationChart holdings={safeHoldings} />
          </div>
        </div>

        <div className="mb-6">
          <AddHoldingForm onAdd={addHolding} />
        </div>

        <HoldingsTable holdings={safeHoldings} onRemove={removeHolding} />
      </div>
    </div>
  );
};

export default DashboardPage;