"use client";

import React, { useState } from "react";
import { Holding } from "@/lib/hooks/useHoldings";

interface AddHoldingFormProps {
  onAdd: (holding: Holding) => void;
}

const AddHoldingForm: React.FC<AddHoldingFormProps> = ({ onAdd }) => {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");

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
    };

    onAdd(holding);

    // Reset form
    setSymbol("");
    setName("");
    setShares("");
    setPurchasePrice("");
    setCurrentPrice("");
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg border border-gray-700 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4">Add New Holding</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-300 mb-2">Symbol</label>
          <input 
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="AAPL"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Company Name</label>
          <input 
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Apple Inc."
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Shares</label>
          <input 
            type="number"
            step="0.01"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="10"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Purchase Price</label>
          <input 
            type="number"
            step="0.01"
            value={purchasePrice}
            onChange={(e) => setPurchasePrice(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="150.00"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-2">Current Price</label>
          <input 
            type="number"
            step="0.01"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="175.00"
            required
          />
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