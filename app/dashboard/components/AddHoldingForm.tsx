"use client";

import React, { useState } from "react";
import { Holding } from "@/lib/hooks/useHoldings";
import { useStockSearch } from "@/lib/hooks/useStockSearch";
import { useStockQuote } from "@/lib/hooks/useStockQuote";

interface AddHoldingFormProps {
  onAdd: (holding: Omit<Holding, "id">) => void;
}

const AddHoldingForm: React.FC<AddHoldingFormProps> = ({ onAdd }) => {
  const [symbol, setSymbol] = useState("");
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0] // Default to today
  );
  const [showSearch, setShowSearch] = useState(false);
  const [selectedStock, setSelectedStock] = useState<{ symbol: string; name: string } | null>(null);

  const { results, loading: searchLoading, searchStocks } = useStockSearch();
  const { quote, loading: quoteLoading, fetchQuote } = useStockQuote();

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSymbol(value);
    setSelectedStock(null);

    if (value.length >= 1) {
      setShowSearch(true);
      searchStocks(value);
    } else {
      setShowSearch(false);
    }
  };

  const handleSelectStock = async (stock: { symbol: string; name: string }) => {
    setSymbol(stock.symbol);
    setSelectedStock({ symbol: stock.symbol, name: stock.name });
    setShowSearch(false);

    // Fetch current price
    await fetchQuote(stock.symbol);
  };

  const handleUseCurrentPrice = () => {
    if (quote?.currentPrice) {
      setPurchasePrice(quote.currentPrice.toFixed(2));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStock || !shares || !purchasePrice) {
      return;
    }

    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(purchasePrice);
    const currentPrice = quote?.currentPrice || priceNum;
    const value = sharesNum * currentPrice;
    const costBasis = sharesNum * priceNum;
    const gainLoss = value - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    onAdd({
      symbol: selectedStock.symbol,
      name: selectedStock.name,
      shares: sharesNum,
      purchasePrice: priceNum,
      currentPrice,
      value,
      gainLoss,
      gainLossPercent,
      lotId: `${selectedStock.symbol}-${Date.now()}`,
      purchaseDate,
    });

    // Reset form
    setSymbol("");
    setShares("");
    setPurchasePrice("");
    setPurchaseDate(new Date().toISOString().split("T")[0]);
    setSelectedStock(null);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
      <h2 className="text-xl font-bold text-white mb-4">Add Holding</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Symbol Search */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-1">Symbol</label>
            <input 
              type="text"
              value={symbol}
              onChange={handleSymbolChange}
              placeholder="Search..."
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            {showSearch && results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-lg shadwo-lg max-h-48 overflow-y-auto">
                {searchLoading ? (
                  <div className="p-3 text-gray-400">Searching...</div>
                ) : (
                  results.slice(0, 5).map((stock) => (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => handleSelectStock(stock)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-600 text-white"
                    >
                      <span className="font-semibold">{stock.symbol}</span>
                      <span className="text-gray-400 text-sm ml-2">{stock.name}</span>
                    </button>
                  ))
                )}
              </div>
            )}
            {selectedStock && (
              <div className="text-green-500 text-xs mt-1">
                ✓ {selectedStock.name}
              </div>
            )}
          </div>

          {/* Shares */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Shares</label>
            <input 
              type="number"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="0"
              min="0"
              step="any"
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Purchase Price */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Purchase Price</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-400">$</span>
              <input
                type="number"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full bg-gray-700 text-white pl-7 pr-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none" 
              />
            </div>
            {quote && !quoteLoading && (
              <button
                type="button"
                onClick={handleUseCurrentPrice}
                className="text-blue-400 text-xs mt-1 hover:text-blue-300"
              >
                Use current: ${quote.currentPrice.toFixed(2)}
              </button>
            )}
            {quoteLoading && (
              <span className="text-gray-500 text-xs mt-1">Loading price...</span>
            )}
          </div>

          {/* Purchase Date */}
          <div>
            <label className="block text-gray-400 text-sm mb-1">Purchase Date</label>
            <input 
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!selectedStock || !shares || !purchasePrice}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Add Holding
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddHoldingForm;