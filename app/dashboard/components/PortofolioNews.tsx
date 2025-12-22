"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Holding } from "@/lib/hooks/useHoldings";

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

  const fetchNews = useCallback(async (symbol?: string) => {
    setLoading(true);
    setError(null);

    try {
      const symbols = symbol && symbol !== "all"
        ? [symbol]
        : holdings.map(h => h.symbol).slice(0, 5); // Limit to 5 to avoid rate limiting

      const newsPromises = symbols.map(async (sym) => {
        const res = await fetch(`/api/stock/news?symbol=${sym}`);
        if (!res.ok) throw new Error(`Failed to fetch news for ${sym}`);
        return res.json();
      });

      const results = await Promise.all(newsPromises);
      const allNews = results.flat();

      // Remove duplicates and sort by date
      const uniqueNews = allNews.reduce((acc: NewsArticle[], article: NewsArticle) => {
        if (!acc.find(a => a.id === article.id)) {
          acc.push(article);
        }
        return acc;
      }, []);

      uniqueNews.sort((a: { datetime: number; }, b: { datetime: number; }) => b.datetime - a.datetime);
      setNews(uniqueNews.slice(0, 10)); // Show top 10 articles
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch news");
    } finally {
      setLoading(false);
    }
  }, [holdings]);

  useEffect(() => {
    if (holdings.length > 0) {
      fetchNews(selectedSymbol);
    }
  }, [holdings, selectedSymbol, fetchNews]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (holdings.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg text-white font-semibold mb-4">Portfolio News</h2>
        <p className="text-white text-muted-foreground">Add holdings to see relevant news.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Portfolio News</h2>
        <select
          value={selectedSymbol}
          onChange={(e) =>setSelectedSymbol(e.target.value)}
          className="rounded-md border bg-background px-3 py-1.5 text-sm"
        >
          <option value="all">All Holdings</option>
          {holdings.map((holding) => (
            <option key={holding.symbol} value={holding.symbol}>
              {holding.symbol}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex items-center justify-between py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="text-destructive text-sm py-4">{error}</div>
      )}

      {!loading && !error && news.length === 0 && (
        <p className="text-muted-foreground">No news available.</p>
      )}

      {!loading && !error && news.length > 0 && (
        <div className="space-y-4">
          {news.map((article) => (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg border p-4 hover:bg-accent transition-colors"
            >
              <div className="flex gap-4">
                {article.image && (
                  <img 
                    src={article.image}
                    alt=""
                    className="w-20 h-20 object-cover rounded-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm line-clamp-2 mb-1">
                    {article.headline}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {article.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{article.source}</span>
                    <span>•</span>
                    <span>{formatDate(article.datetime)}</span>
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioNews;