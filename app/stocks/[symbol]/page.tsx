"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStockQuote } from "@/lib/hooks/useStockQuote";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import LoadingSpinner from "@/components/LoadingSpinner";
import Link from "next/link";

interface StockProfile {
  name: string;
  ticker: string;
  exchange: string;
  industry: string;
  logo: string;
  weburl: string;
  marketCapitalization: number;
}

const StockDetailPage: React.FC = () => {
  const params = useParams();
  const symbol = params.symbol as string;

  const { quote, loading: quoteLoading, error: quoteError, fetchQuote } = useStockQuote();
  const { watchlist, addToWatchlist } = useWatchlist();

  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const isInWatchlist = watchlist.some((s) => s.symbol === symbol.toUpperCase());

  useEffect(() => {
    if (symbol) {
      fetchQuote(symbol);
      fetchProfile();
    }
  }, [symbol]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/stock/profile?symbol=${symbol}`);
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    await addToWatchlist({
      symbol: symbol.toUpperCase(),
      name: profile?.name || symbol.toUpperCase(),
      type: "Stock",
      region: "US",
    });
  };

  if (quoteLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6 flex items-center justify-center">
        <LoadingSpinner size="lg" text={`Loading ${symbol}...`} />
      </div>
    );
  }

  if (quoteError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{quoteError}</p>
            <Link href="/stocks" className="text-blue-500 hover:text-blue-400">
              ⬅️ Back to Stocks
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <Link href="/stocks" className="text-blue-500 hover:text-blue-400 mb-4 inline-block">
          ⬅️ Back to Stocks
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              {profile?.logo && (
                <img src={profile.logo} alt={profile.name} className="w-16 h-16 rounded-lg" />
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {symbol.toUpperCase()}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{profile?.name || "Unknown Company"}</p>
                {profile?.exchange && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">{profile.exchange}</p>
                )}
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

          <Link
            href={`/stocks/compare?symbols=${symbol}`}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
          >
            Compare with other stocks →
          </Link>

          {quote && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${quote.currentPrice.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Change</p>
                <p className={`text-2xl font-bold ${quote.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {quote.change >= 0 ? "+" : ""}{quote.change.toFixed(2)} ({quote.changePercent.toFixed(2)}%)
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">High</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${quote.high.toFixed(2)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Low</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">${quote.low.toFixed(2)}</p>
              </div>
            </div>
          )}

          {profile?.industry && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">Industry</p>
              <p className="text-gray-900 dark:text-white">{profile.industry}</p>
            </div>
          )}

          {profile?.marketCapitalization && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Cap</p>
              <p className="text-gray-900 dark:text-white">
                ${(profile.marketCapitalization / 1000).toFixed(2)}B
              </p>
            </div>
          )}

          {profile?.weburl && (
            <div className="mt-4">
              <a
                href={profile.weburl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-400"
              >
                Visit Website ➡️
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;