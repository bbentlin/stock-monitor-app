"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useStockQuote, StockQuote } from "@/lib/hooks/useStockQuote";
import { useWatchlist } from "@/lib/hooks/useWatchlist";

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
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [addingToWatchlist, setAddingToWatchlist] = useState(false);

  useEffect(() => {
    if (symbol) {
      fetchQuote(symbol);
      fetchProfile(symbol);
    }
  }, [symbol]);

  useEffect(() => {
    setIsInWatchlist(watchlist.some((s) => s.symbol === symbol.toUpperCase()));
  }, [watchlist, symbol]);

  const fetchProfile = async (sym: string) => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const response = await fetch(`/api/stock/profile?symbol=${sym}`);
      const data = await response.json();

      if (response.ok && data.name) {
        setProfile(data);
      } else {
        setProfileError(data.error || "Failed to load company profile");
      } 
    } catch (err) {
      setProfileError("Failed to load company profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleAddToWatchlist = async () => {
    if (isInWatchlist || !profile) return;

    setAddingToWatchlist(true);
    const success = await addToWatchlist({
      symbol: symbol.toUpperCase(),
      name: profile.name,
      type: "Common Stock",
      region: "US",
    });

    if (success) {
      setIsInWatchlist(true);
    }
    setAddingToWatchlist(false);
  };

  const isLoading = quoteLoading || profileLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6 flex items-center justify-center">
        <div className="text-white text-xl">Loading {symbol}...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Back Button */}
        <Link
          href="/stocks"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Stocks
        </Link>

        {/* Header */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profile?.logo && (
                <img 
                  src={profile.logo}
                  alt={profile.name}
                  className="w-16 h-16 rounded-lg bg-white p-1"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{symbol.toUpperCase()}</h1>
                <p className="text-gray-400 text-lg">{profile?.name || "Loading..."}</p>
                {profile?.exchange && (
                  <p className="text-gray-500 text-sm">{profile.exchange}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleAddToWatchlist}
              disabled={isInWatchlist || addingToWatchlist}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isInWatchlist
                  ? "bg-green-600 text-white cursor-default"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              }`}
            >
              {isInWatchlist ? "✓ In Watchlist" : addingToWatchlist ? "Adding..." : "Add to Watchlist"}
            </button>
          </div>
        </div>

        {/* Price Card */}
        {quote ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Price Information</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 p-4 rounded-lg"> 
                <p className="text-gray-400 text-sm">Current Price</p>
                <p className="text-2xl font-bold text-white">${quote.currentPrice.toFixed(2)}</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Change</p>
                <p className={`text-2xl font-bold ${quote.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                  <span className="text-sm ml-1">
                    ({quote.changePercent >= 0 ? "+" : ""}{quote.changePercent?.toFixed(2) || "0.00"}%)
                  </span>
                </p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Day High</p>
                <p className="text-xl font-semibold text-white">${quote.high?.toFixed(2) || "N/A"}</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Day Low</p>
                <p className="text-xl font-semibold text-white">${quote.low?.toFixed(2) || "N/A"}</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Open</p>
                <p className="text-xl font-semibold text-white">${quote.open?.toFixed(2) || "N/A"}</p>
              </div>

              <div className="bg-gray-900 p-4 rounded-lg">
                <p className="text-gray-400 text-sm">Previous Close</p>
                <p className="text-xl font-semibold text-white">${quote.previousClose?.toFixed(2) || "N/A"}</p>
              </div>

              {profile?.marketCapitalization && (
                <div className="bg-gray-900 p-4 rounded-lg col-span-2">
                  <p className="text-gray-400 text-sm">Market Cap</p>
                  <p className="text-xl font-semibold text-white">
                    ${(profile.marketCapitalization / 1000).toFixed(2)}B
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : quoteError ? (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {quoteError}
          </div>
        ) : null}

        {/* Company Info */}
        {profile && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
            <h2 className="text-xl font-semibold text-white mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.industry && (
                <div>
                  <p className="text-gray-400 text-sm">Industry</p>
                  <p className="text-white">{profile.industry}</p>
                </div>
              )}
              {profile.weburl && (
                <div>
                  <p className="text-gray-400 text-sm">Website</p>
                  <a
                    href={profile.weburl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-400"
                  >
                    {profile.weburl}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {profileError && !profile && (
          <div className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 p-4 rounded-lg mb-6">
            {profileError}
          </div>
        )}

        {/* Add to Holdings Button */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Track This Stock</h2>
          <p className="text-gray-400 mb-4">
            Want to track your investment in {symbol.toUpperCase()}? Add it to your portfolio.
          </p>
          <Link
            href={`/dashboard?add=${symbol}`}
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Add to Holdings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;