"use client";

import { useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercent, formatCompactNumber } from "@/lib/utils/formatters";
import { Skeleton } from "@/components/Skeleton";
import { useStockSearch } from "@/lib/hooks/useStockSearch";
import { Suspense } from "react";

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number | null;
  dividend: number;
  week52High: number;
  week52Low: number;
  volume: number;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function CompareStocksContent() {
  const searchParams = useSearchParams();
  const initialSymbols = searchParams.get("symbols")?.split(",").filter(Boolean) ?? [];
  const [symbols, setSymbols] = useState<string[]>(initialSymbols);
  const [newSymbol, setNewSymbol] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, loading: searchLoading, searchStocks } = useStockSearch();

  const { data, isLoading, error } = useSWR<{ quotes: StockData[] }>(
    symbols.length > 0 ? `/api/stock/quotes?symbols=${symbols.join(",")}&detailed=true` : null,
    fetcher
  );

  // Reset highlighted index when results change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [results]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll("button");
      if (items[highlightedIndex]) {
        items[highlightedIndex].scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const addSymbol = (symbol?: string) => {
    const sym = (symbol ?? newSymbol).toUpperCase().trim();
    if (sym && !symbols.includes(sym) && symbols.length < 5) {
      setSymbols([...symbols, sym]);
      setNewSymbol("");
      setShowSearch(false);
      setHighlightedIndex(-1);
    }
  };

  const removeSymbol = (symbol: string) => {
    setSymbols(symbols.filter((s) => s !== symbol));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewSymbol(value);
    setHighlightedIndex(-1);
    if (value.length >= 2) {
      setShowSearch(true);
      searchStocks(value);
    } else {
      setShowSearch(false);
    }
  };

  const handleSelectStock = (symbol: string) => {
    addSymbol(symbol);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSearch && results.length > 0) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : prev
          );
          return;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          return;
        case "Escape":
          setShowSearch(false);
          setHighlightedIndex(-1);
          return;
        case "Tab":
          if (highlightedIndex >= 0 && results[highlightedIndex]) {
            e.preventDefault();
            handleSelectStock(results[highlightedIndex].symbol);
          }
          return;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && results[highlightedIndex]) {
            handleSelectStock(results[highlightedIndex].symbol);
          } else {
            addSymbol();
          }
          return;
      }
    }

    if (e.key === "Enter") {
      e.preventDefault();
      addSymbol();
    }
  };

  const stocks: StockData[] = Array.isArray(data?.quotes) ? data.quotes : [];

  const metrics: { key: keyof StockData; label: string; format: (v: any) => string }[] = [
    { key: "price", label: "Price", format: (v) => formatCurrency(v) },
    { key: "changePercent", label: "Change %", format: (v) => formatPercent(v) },
    { key: "marketCap", label: "Market Cap", format: (v) => `$${formatCompactNumber(v)}` },
    { key: "peRatio", label: "P/E Ratio", format: (v) => v?.toFixed(2) ?? "N/A" },
    { key: "dividend", label: "Div Yield", format: (v) => `${v?.toFixed(2) ?? 0}%` },
    { key: "week52High", label: "52W High", format: (v) => formatCurrency(v) },
    { key: "week52Low", label: "52W Low", format: (v) => formatCurrency(v) },
    { key: "volume", label: "Volume", format: (v) => formatCompactNumber(v) },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Compare Stocks
        </h1>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1 max-w-xs">
            <input
              ref={inputRef}
              type="text"
              value={newSymbol}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={() => {
                setTimeout(() => setShowSearch(false), 200);
              }}
              onFocus={() => {
                if (newSymbol.length >= 2 && results.length > 0) {
                  setShowSearch(true);
                }
              }}
              placeholder="Search stocks (e.g., AAPL)"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              maxLength={10}
              autoComplete="off"
              role="combobox"
              aria-expanded={showSearch}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              aria-activedescendant={
                highlightedIndex >= 0 ? `compare-option-${highlightedIndex}` : undefined
              }
            />
            {showSearch && results.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                role="listbox"
              >
                {results.map((stock, index) => {
                  const alreadyAdded = symbols.includes(stock.symbol);
                  return (
                    <button
                      key={stock.symbol}
                      id={`compare-option-${index}`}
                      type="button"
                      onClick={() => handleSelectStock(stock.symbol)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      disabled={alreadyAdded || symbols.length >= 5}
                      className={`w-full px-4 py-2 text-left text-gray-900 dark:text-white transition-colors ${
                        alreadyAdded
                          ? "opacity-50 cursor-not-allowed"
                          : index === highlightedIndex
                          ? "bg-blue-100 dark:bg-blue-600"
                          : "hover:bg-gray-100 dark:hover:bg-gray-600"
                      }`}
                      role="option"
                      aria-selected={index === highlightedIndex}
                    >
                      <span className="font-medium">{stock.symbol}</span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">
                        {stock.name}
                      </span>
                      {alreadyAdded && (
                        <span className="text-blue-500 ml-2 text-xs font-medium">Added</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {searchLoading && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
                Searching...
              </div>
            )}
          </div>
          <button
            onClick={() => {
              if (highlightedIndex >= 0 && results[highlightedIndex]) {
                handleSelectStock(results[highlightedIndex].symbol);
              } else {
                addSymbol();
              }
            }}
            disabled={symbols.length >= 5 || !newSymbol.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {symbols.map((symbol) => (
            <span
              key={symbol}
              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full flex items-center gap-2"
            >
              {symbol}
              <button
                onClick={() => removeSymbol(symbol)}
                className="hover:text-red-600"
                aria-label={`Remove ${symbol}`}
              >
                <X className="h-4 w-4" />
              </button>
            </span>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">
              Failed to load stock data. Please try again.
            </p>
          </div>
        )}

        {symbols.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              Add up to 5 stocks to compare
            </p>
          </div>
        ) : isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <Skeleton className="h-6 w-32" />
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3"><Skeleton className="h-4 w-16" /></th>
                  {symbols.map((s) => (
                    <th key={s} className="px-4 py-3">
                      <Skeleton className="h-5 w-16 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                    {symbols.map((s) => (
                      <td key={s} className="px-4 py-3"><Skeleton className="h-4 w-16" /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Metric
                  </th>
                  {stocks.map((stock) => (
                    <th key={stock.symbol} className="px-4 py-3 text-left">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {stock.symbol}
                      </div>
                      <div className="text-sm font-normal text-gray-500 truncate max-w-32">
                        {stock.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric) => (
                  <tr
                    key={metric.key}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      {metric.label}
                    </td>
                    {stocks.map((stock) => {
                      const value = stock[metric.key];
                      const isChange = metric.key === "changePercent";
                      return (
                        <td
                          key={stock.symbol}
                          className={`px-4 py-3 text-sm ${
                            isChange
                              ? (value as number) >= 0
                                ? "text-green-600"
                                : "text-red-600"
                              : "text-gray-900 dark:text-white"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {isChange &&
                              (value as number) >= 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : isChange ? (
                                <TrendingDown className="h-4 w-4" />
                              ) : null}
                            {metric.format(value)}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CompareStocksPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center">Loading comparison...</div>}>
      <CompareStocksContent />
    </Suspense>
  );
}