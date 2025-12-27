import React from "react";
import Link from "next/link";

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Smart Stock Portfolio Management
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Track your investments, analyze performance, and discover new opportunities with powerful insights.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              View Dashboard
            </Link>
            <Link
              href="/stocks"
              className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Explore Stocks
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors shadow-sm">
            <div className="text-blue-500 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Track Holdings</h3>
            <p className="text-gray-600 dark:text-gray-400">Monitor your portfolio performance in real-time with detailed analytics.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors shadow-sm">
            <div className="text-blue-500 text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Stock Screener</h3>
            <p className="text-gray-600 dark:text-gray-400">Discover new investment opportunities with advanced filtering tools.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-500 transition-colors shadow-sm">
            <div className="text-blue-500 text-4xl mb-4">📈</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Performance Charts</h3>
            <p className="text-gray-600 dark:text-gray-400">Visualize trends and make data-driven investment decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;