"use client";

import React, { useEffect, useState, useRef } from "react";
import { Holding } from "@/lib/hooks/useHoldings";
import { useStockSearch } from "@/lib/hooks/useStockSearch";
import { useStockQuote } from "@/lib/hooks/useStockQuote";

interface AddHoldingFormProps {
  onAdd: (holding: Holding) => void;
}

const AddHoldingForm: React.FC<AddHoldingFormProps> = ({ onAdd }) => {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchField, setSearchField] = useState<"symbol" | "name">("symbol");
  
  const { results, loading: searchLoading, error: searchError, searchStocks } = useStockSearch();
  const { quote, loading: quoteLoading, error: quoteError, fetchQuote } = useStockQuote();

  // Fix: Use ref to track if purchase price was manually set
  const purchasePriceSetRef = useRef(false);

  const handleSearchChange = (value: string, field: "symbol" | "name") => {
    setSearchField(field);

    if (field === "symbol") {
      setSymbol(value);
    } else {
      setName(value);
    }

    if (value.length >= 2) {
      searchStocks(value);
      setShowSearchResults(true);
    } else {
      setShowSearchResults(false);
    }
  };

  const handleSelectStock = async (stock: { symbol: string; name: string }) => {
    setSymbol(stock.symbol);
    setName(stock.name);
    setShowSearchResults(false);
    purchasePriceSetRef.current = false;
    
    // Auto-fetch current price
    await fetchQuote(stock.symbol);
  };

  // Update current price when quote is fetched
  useEffect(() => {
    if (quote) {
      setCurrentPrice(quote.currentPrice.toFixed(2));
      // Only set purchase price if not manually set
      if (!purchasePriceSetRef.current && !purchasePrice) {
        setPurchasePrice(quote.currentPrice.toFixed(2));
      }
    }
  }, [quote, purchasePrice]);

  const handlePurchasePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    purchasePriceSetRef.current = true;
    setPurchasePrice(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const sharesNum = parseFloat(shares);
    const purchasePriceNum = parseFloat(purchasePrice);
    const currentPriceNum = parseFloat(currentPrice);
    const value = sharesNum * currentPriceNum;
    const gainLoss = value - (sharesNum * purchasePriceNum);
    const gainLossPercent = (gainLoss / (sharesNum * purchasePriceNum)) * 100;

    const holding: Holding = {
      symbol: symbol.toUpperCase(),
      name,
      shares: sharesNum,
      purchasePrice: purchasePriceNum,
      currentPrice: currentPriceNum,
      value,
      gainLoss,
      gainLossPercent,
      lotId: `${symbol.toUpperCase()}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      purchaseDate: new Date().toISOString(),
    };

    onAdd(holding);

    // Reset form
    setSymbol("");
    setName("");
    setShares("");
    setPurchasePrice("");
    setCurrentPrice("");
    purchasePriceSetRef.current = false;
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Add New Holding</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-gray-300 mb-2">Symbol</label>
          <input 
            type="text"
            value={symbol}
            onChange={(e) => handleSearchChange(e.target.value, "symbol")}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Type to search (AAPL, TSLA, etc.)"
            required
          />
          
          {/* Search Results Dropdown for Symbol field*/}
          {showSearchResults && searchField === "symbol" && (
            <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
              {searchLoading && (
                <div className="p-3 text-gray-400 text-sm">Searching...</div>
              )}
              {searchError && (
                <div className="p-3 text-red-500 text-sm">{searchError}</div>
              )}
              {!searchLoading && !searchError && results.length === 0 && symbol.length >= 2 && (
                <div className="p-3 text-gray-400 text-sm">No results found</div>
              )}
              {!searchLoading && results.length > 0 && (
                <div>
                  {results.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock)}
                      className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700 last:border-b-0"
                    >
                      <div className="font-semibold text-white">{stock.symbol}</div>
                      <div className="text-sm text-gray-400">{stock.name}</div>
                      <div className="text-xs text-gray-500">{stock.type} • {stock.region}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <label className="block text-gray-300 mb-2">Company Name</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => handleSearchChange(e.target.value, "name")}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Auto-filled from search"
            required
          />

          {/* Search Results Dropdown for Name field */}
          {showSearchResults && searchField === "name" && (
            <div className="absolute z-10 w-full mt-1 bg-gray-900 border border-gray-700 rounded-lg max-h-60 overflow-y-auto">
              {searchLoading && (
                <div className="p-3 text-gray-400 text-sm">Searching...</div>
              )}
              {searchError && (
                <div className="p-3 text-red-500 text-sm">{searchError}</div>
              )}
              {!searchLoading && !searchError && results.length === 0 && name.length >= 2 && (
                <div className="p-3 text-gray-400 text-sm">No results found</div>
              )}
              {!searchLoading && results.length > 0 && (
                <div>
                  {results.map((stock) => (
                    <div
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock)}
                      className="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700 last:border-b-0"
                    >
                      <div className="font-semibold text-white">{stock.symbol}</div>
                      <div className="text-sm text-gray-400">{stock.name}</div>
                      <div className="text-xs text-gray-500">{stock.type} • {stock.region}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Shares</label>
          <input 
            type="number"
            step="any"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="10"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            Purchase Price
            {quoteLoading && <span className="text-yellow-500 text-xs ml-2">(Loading...)</span>}
          </label>
          <input 
            type="number"
            step="0.01"
            value={purchasePrice}
            onChange={handlePurchasePriceChange}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Auto-filled or enter manually"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">
            Current Price
            {quoteLoading && <span className="text-yellow-500 text-xs ml-2">(Loading...)</span>}
            {quote && <span className="text-green-500 text-xs ml-2">(Live price)</span>}
          </label>
          <input 
            type="number"
            step="0.01"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Auto-filled from live data"
            required
          />
          {quoteError && (
            <p className="text-red-500 text-xs mt-1">{quoteError}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Add Holding
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddHoldingForm;