"use client";

import React, { useState, useRef, useEffect } from "react";
import { Holding } from "@/types";
import { useStockSearch } from "@/lib/hooks/useStockSearch";

interface AddHoldingFormProps {
  onAddHolding: (holding: Omit<Holding, "id">) => Promise<void>;
}

const AddHoldingForm: React.FC<AddHoldingFormProps> = ({ onAddHolding }) => {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showSearch, setShowSearch] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const { results, loading, error, searchStocks } = useStockSearch();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);
    setSelectedStock(null);
    setHighlightedIndex(-1);
    if (value.length >= 2) {
      setShowSearch(true);
      searchStocks(value);
    } else {
      setShowSearch(false);
    }
  };

  const handleSelectStock = (stock: { symbol: string; name: string }) => {
    setSymbol(stock.symbol);
    setSelectedStock(stock);
    setShowSearch(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSearch || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelectStock({
            symbol: results[highlightedIndex].symbol,
            name: results[highlightedIndex].name,
          });
        }
        break;
      case "Escape":
        setShowSearch(false);
        setHighlightedIndex(-1);
        break;
      case "Tab":
        if (highlightedIndex >= 0 && results[highlightedIndex]) {
          handleSelectStock({
            symbol: results[highlightedIndex].symbol,
            name: results[highlightedIndex].name,
          });
        }
        setShowSearch(false);
        break;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !shares || !purchasePrice) return;

    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(purchasePrice);

    onAddHolding({
      symbol: symbol.toUpperCase(),
      name: selectedStock?.name || symbol.toUpperCase(),
      shares: sharesNum,
      purchasePrice: priceNum,
      currentPrice: priceNum,
      value: sharesNum * priceNum,
      gainLoss: 0,
      gainLossPercent: 0,
      lotId: `${symbol}-${Date.now()}`,
      purchaseDate,
    });

    // Reset form
    setSymbol("");
    setShares("");
    setPurchasePrice("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setSelectedStock(null);
    setHighlightedIndex(-1);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Add Holding</h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Symbol
          </label>
          <input
            ref={inputRef}
            type="text"
            value={symbol}
            onChange={handleSymbolChange}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              // Delay hiding to allow click on dropdown items
              setTimeout(() => setShowSearch(false), 200);
            }}
            onFocus={() => {
              if (symbol.length >= 2 && results.length > 0) {
                setShowSearch(true);
              }
            }}
            placeholder="AAPL"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            autoComplete="off"
            role="combobox"
            aria-expanded={showSearch}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            aria-activedescendant={
              highlightedIndex >= 0 ? `stock-option-${highlightedIndex}` : undefined
            }
          />
          {showSearch && results.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              role="listbox"
            >
              {results.map((stock, index) => (
                <button
                  key={stock.symbol}
                  id={`stock-option-${index}`}
                  type="button"
                  onClick={() => handleSelectStock({ symbol: stock.symbol, name: stock.name })}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`w-full px-4 py-2 text-left text-gray-900 dark:text-white transition-colors ${
                    index === highlightedIndex
                      ? "bg-blue-100 dark:bg-blue-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                  role="option"
                  aria-selected={index === highlightedIndex}
                >
                  <span className="font-medium">{stock.symbol}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2 text-sm">{stock.name}</span>
                </button>
              ))}
            </div>
          )}
          {loading && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg p-3 text-center text-gray-500 dark:text-gray-400 text-sm">
              Searching...
            </div>
          )}
          {selectedStock && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedStock.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Shares
          </label>
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="100"
            min="0"
            step="any"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Purchase Price
          </label>
          <input
            type="number"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            placeholder="150.00"
            min="0"
            step="0.01"
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Purchase Date
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHoldingForm;