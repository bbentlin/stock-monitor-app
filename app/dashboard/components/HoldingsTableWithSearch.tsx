"use client";

import { useState, useMemo } from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { Holding } from "@/types";
import HoldingsTable from "./HoldingsTable";

interface HoldingsTableWithSearchProps {
  holdings: Holding[];
  onUpdate: (lotId: string, updates: Partial<Holding>) => Promise<void>;
  onRemove: (lotId: string) => Promise<void>;
}

export default function HoldingsTableWithSearch({
  holdings,
  onUpdate,
  onRemove,
}: HoldingsTableWithSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"symbol" | "value" | "gain">("symbol");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showFilters, setShowFilters] = useState(false);

  const filteredHoldings = useMemo(() => {
    let result = [...holdings];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLocaleLowerCase();
      result = result.filter((h) =>
        h.symbol.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "symbol":
          comparison = a.symbol.localeCompare(b.symbol);
          break;
        case "value":
          comparison = a.value - b.value;
          break;
        case "gain":
          const gainA = ((a.currentPrice ?? a.purchasePrice) - a.purchasePrice) / a.purchasePrice;
          const gainB = ((b.currentPrice ?? b.purchasePrice) - b.purchasePrice) / b.purchasePrice;
          comparison = gainA - gainB;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [holdings, searchQuery, sortBy, sortOrder]);

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search holdings..."
            className="w-full pl-10 pr-10 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none" 
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
          aria-label="Toggle filters"
        >
          <SlidersHorizontal className="h-5 w-5" />
        </button>
      </div>

      {showFilters && (
        <div className="flex gap-4 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="ml-2 border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="symbol">Symbol</option>
              <option value="value">Value</option>
              <option value="gain">Gain %</option>  
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Order</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="ml-2 border rounded px-2 py-1 text-sm dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      )}

      {filteredHoldings.length === 0 && searchQuery ? (
        <div className="text-center py-8 text-gray-500">
          No holdings match "{searchQuery}"
        </div>
      ) : (
        <HoldingsTable
          holdings={filteredHoldings}
          onUpdate={onUpdate}          
          onRemove={onRemove}
        />
      )}
    </div>
  );
}