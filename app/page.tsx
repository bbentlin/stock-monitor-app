import React from "react";
import Link from "next/link";

const HomePage: React.FC = () => {
  return (
   <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
    <div className="container mx-auto px-4 py-12 sm:py-20">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
          Smart Stock Portfolio Management
        </h1>
        <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4">
          Track your investments, analyze performance, and discover new opportunities with powerful insights.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
          <Link 
            href="/dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transition-colors text-center"
          >
            View Dashboard
          </Link>
          <Link 
            href="/stocks"
            className="border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-900 dark:text-white px-6 sm:px-8 py-3 rounded-lg font-semibold transition-colors text-center"
          >
            Browse Stocks
          </Link>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors shadow-sm">
          <div className="text-blue-500 text-3xl sm:text-4xl mb-3 sm:mb-4">📊</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Real-Time Tracking
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Monitor your portfolio with live price updates and instant notifications.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors shadow-sm">
          <div className="text-blue-500 text-3xl sm:text-4xl mb-3 sm:mb-4">🔎</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Stock Screener
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Discover new investment opportunities with advanced filtering tools.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors shadow-sm sm:col-span-2 lg:col-span-1">
          <div className="text-blue-500 text-3xl sm:text-4xl mb-3 sm:mb-4">📈</div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3">
            Performance Charts
          </h3>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Visualize trends and make data-driven investment decisions.
          </p>
        </div>
      </div>
    </div>
   </div>
  );
};

export default HomePage;