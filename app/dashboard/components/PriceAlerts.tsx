"use client";

import React, { useState } from "react";
import { Holding } from "@/types";
import { usePriceAlerts } from "@/lib/hooks/usePriceAlerts";

interface PriceAlertsProps {
  holdings: Holding[];
}

const PriceAlerts: React.FC<PriceAlertsProps> = ({ holdings }) => {
  const { alerts, addAlert, removeAlert } = usePriceAlerts();
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    symbol: "",
    targetPrice: "",
    condition: "above" as "above" | "below",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.symbol) {
      setFormError("Please select a symbol")
      return;
    }

    const price = parseFloat(formData.targetPrice);
    if (isNaN(price) || price <= 0) {
      setFormError("Please enter a valid price");
      return;
    }

    try {
      addAlert(formData.symbol, price, formData.condition);
      setFormData({ symbol: "", targetPrice: "", condition: "above" });
      setIsAdding(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create alert");
    }
  };

  const handleDelete = async (alertId: string) => {
    try {
      await removeAlert(alertId);
    } catch (err) {
      console.error("Failed to delete alert:", err);
    }
  };

  const getSymbolPrice = (symbol: string) => {
    const holding = holdings.find((h) => h.symbol === symbol);
    return holding?.currentPrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Price Alert</h2>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="rounded-md bg-blue-600  hover:bg-blue-700  px-3 py-1.5 text-sm text-white transition-colors"
          >
            + Add Alert
          </button>
        )}
      </div>
      
      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Symbol</label>
              <select
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="">Select Symbol</option>
                {holdings.map((holding) => (
                  <option key={holding.symbol} value={holding.symbol}>
                    {holding.symbol} ({formatPrice(holding.currentPrice || 0)})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Condition</label>
              <select
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value as "above" | "below" })
                }
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              >
                <option value="above">Price goes above</option>
                <option value="below">Price goes below</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Price ($)</label>
              <input 
                type="number"
                step="0.01"
                min="0"
                value={formData.targetPrice}
                onChange={(e) => setFormData({ ...formData, targetPrice: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {formError && (
            <p className="text-red-500 text-sm mb-4">{formError}</p>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 text-sm text-white transition-colors"
            >
              Create Alert
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setFormError(null);
                setFormData({ symbol: "", targetPrice: "", condition: "above" });
              }}
              className="rounded-md border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {alerts.length === 0 && !isAdding && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No price alerts set. Create one to get notified when a stock reaches your target price.
        </p>
      )}

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const currentPrice = getSymbolPrice(alert.symbol);
            const isTriggered = 
              currentPrice &&
              ((alert.condition === "above" && currentPrice >= alert.targetPrice) ||
                (alert.condition === "below" && currentPrice <= alert.targetPrice));

            return (
              <div
                key={alert.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isTriggered
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className={`w-2 h-2 rounded-full ${
                      isTriggered ? "bg-green-500" : "bg-gray-400 dark:bg-gray-500"  
                    }`}
                  />
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-white">
                      {alert.symbol}
                      <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
                        {alert.condition === "above" ? "↑" : "↓"} {formatPrice(alert.targetPrice)}
                      </span>
                    </div>
                    {currentPrice && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Current: {formatPrice(currentPrice)}
                        {isTriggered && (
                          <span className="text-green-500 ml-2">• Price Alert!</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(alert.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1"
                  title="Delete alert"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"  
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PriceAlerts;