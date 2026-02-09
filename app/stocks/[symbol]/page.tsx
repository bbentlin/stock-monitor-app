"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useStockQuote } from "@/lib/hooks/useStockQuote";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";
import { formatCurrency, formatPercent, formatCompactNumber } from "@/lib/utils/formatters";

interface StockProfile {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  logo: string;
  weburl: string;
  marketCapitalization: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const StockDetailPage: React.FC = () => {
  const params = useParams();
  const symbol = (params.symbol as string).toUpperCase();

  const { quote, loading: quoteLoading, error: quoteError, fetchQuote } = useStockQuote();
  const { watchlist, addToWatchlist } = useWatchlist();

  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
  } = useSWR<StockProfile>(
    symbol ? `/api/stock/profile?symbol=${symbol}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const isInWatchlist = watchlist.some((s) => s.symbol === symbol);

  useEffect(() => {
    if (symbol) fetchQuote(symbol);
  }, [symbol]);

  const handleAddToWatchlist = () => {
    addToWatchlist({
      symbol,
      name: profile?.name ?? symbol,
      type: "stock",
      region: "US",
    });
  };

  if (quoteLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back link */}
        <Link
          href="/stocks"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm mb-4 inline-block"
        >
          ← Back to Stocks
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              {profile?.logo && (
                <img
                  src={profile.logo}
                  alt={`${profile.name} logo`}
                  className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-200 dark:border-gray-600 p-1"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {symbol}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  {profile?.name ?? symbol}
                  {profile?.exchange && (
                    <span className="ml-2 text-sm">• {profile.exchange}</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={handleAddToWatchlist}
              disabled={isInWatchlist}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isInWatchlist
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isInWatchlist ? "In Watchlist" : "Add to Watchlist"}
            </button>
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href={`/stocks/compare?symbols=${symbol}`}
              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              📊 Compare with other stocks →
            </Link>
          </div>
        </div>

        {/* Error */}
        {(quoteError || profileError) && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">
              {quoteError ?? "Failed to load stock data. Please try again."}
            </p>
          </div>
        )}

        {/* Quote data */}
        {quote && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(quote.currentPrice)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Change</p>
              <p className={`text-2xl font-bold ${quote.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatCurrency(quote.change)}
              </p>
              <p className={`text-sm ${quote.changePercent >= 0 ? "text-green-500" : "text-red-500"}`}>
                {formatPercent(quote.changePercent)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(quote.high)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl">
              <p className="text-sm text-gray-500 dark:text-gray-400">Low</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(quote.low)}
              </p>
            </div>
          </div>
        )}

        {/* Additional quote details */}
        {quote && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Trading Details
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Open</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(quote.open)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Previous Close</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(quote.previousClose)}
                </p>
              </div>
              {profile?.marketCapitalization && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    ${formatCompactNumber(profile.marketCapitalization * 1e6)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Company Profile */}
        {profile && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Company Profile
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {profile.industry && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profile.industry}
                  </p>
                </div>
              )}
              {profile.exchange && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Exchange</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {profile.exchange}
                  </p>
                </div>
              )}
              {profile.weburl && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Website</p>
                  <a
                    href={profile.weburl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium text-sm truncate block"
                  >
                    {profile.weburl.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No data state */}
        {!quote && !quoteLoading && !quoteError && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No data available for {symbol}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDetailPage;