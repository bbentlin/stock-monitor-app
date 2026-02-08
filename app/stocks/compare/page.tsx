"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Plus, X, TrendingUp, TrendingDown } from "lucide-react";
import { formatCurrency, formatPercent, formatCompactNumber } from "@/lib/utils/formatters";

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

export default function CompareStocksPage() {
  const searchParams = useSearchParams();
  const initialSymbols = searchParams.get("symbols")?.split(",").filter(Boolean) ?? [];
  const [symbols, setSymbols] = useState<string[]>(initialSymbols);
  const [newSymbol, setNewSymbol] = useState("");

  const { data, isLoading } = useSWR<{ quotes: StockData[] }>(
    symbols.length > 0 ? `/api/stock/quotes?symbols=${symbols.join(",")}` : null,
    fetcher
  );

  const addSymbol = () => {
    const symbol = newSymbol.toUpperCase().trim();
    if (symbol && !symbols.includes(symbol) && symbols.length < 5) {
      setSymbols([...symbols, symbol]);
      setNewSymbol("");
    }
  };

  const removeSymbol = (symbol: string) => {
    setSymbols(symbols.filter((s) => s !== symbol));
  };

  const stocks = data?.quotes ?? [];

  const metrics: { key: keyof StockData; label: string; format: (v: any) => string}[] = [
    { key: "price", label: "Price", format: (v) => formatCurrency(v) },
    { key: "changePercent", label: "Change %", format: (v) => formatPercent(v) },
    { key: "marketCap", label: "Market Cap", format: (v) => `$${formatCompactNumber(v)}`},
    { key: "peRatio", label: "P/E Ratio", format: (v) => v?.toFixed(2) ?? "N/A" },
    { key: "dividend", label: "Div Yield", format: (v) => `${v?.toFixed(2) ?? 0}%`},
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
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && addSymbol()}
            placeholder="Enter symbol (e.g., AAPL)"
            className="flex-1 max-w-xs px-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            maxLength={5}
          />
          <button
            onClick={addSymbol}
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

        {symbols.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              Add up to 5 stocks to compare
            </p>
          </div>
        ) : isLoading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">Loading stock data...</p>
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