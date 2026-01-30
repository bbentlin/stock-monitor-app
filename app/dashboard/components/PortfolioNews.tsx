"use client";

import React, { useEffect, useState } from "react";
import { Holding } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";

interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
}

interface PortfolioNewsProps {
  holdings: Holding[];
}

const PortfolioNews: React.FC<PortfolioNewsProps> = ({ holdings }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState<string>("all");

  useEffect(() => {
    fetchNews();
  }, [selectedSymbol]);

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        selectedSymbol === "all"
          ? "/api/stock/news"
          : `/api/stock/news?symbol=${selectedSymbol}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setNews([]);
      } else {
        setNews(data.articles || []);
      }
    } catch (err) {
      setError("Failed to fetch news. Please try again.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Market News</h2>
        <select
          value={selectedSymbol}
          onChange={(e) => setSelectedSymbol(e.target.value)}
          className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1 text-gray-900 dark:text-white text-sm"
        >
          <option value="all">All News</option>
          {holdings.map((h) => (
            <option key={h.symbol} value={h.symbol}>
              {h.symbol}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 flex justify-center">
            <LoadingSpinner text="Loading news..." />
          </div>
        ) : error ? (
          <div className="p-4 text-red-500">{error}</div>
        ) : news.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">No news available</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {news.map((article) => (
              <a
                key={article.id}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                  {article.headline}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
                  {article.summary}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                  <span>{article.source}</span>
                  <span>•</span>
                  <span>{formatDate(article.datetime)}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioNews;