"use client";

import { useState, useEffect, useCallback } from "react";

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  triggered: boolean;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = "price_alerts";

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      setAlerts(JSON.parse(stored));
    }
  }, []);

  const saveAlerts = useCallback((newAlerts: PriceAlert[]) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newAlerts));
    setAlerts(newAlerts);
  }, []);

  const addAlert = useCallback((symbol: string, targetPrice: number, condition: "above" | "below") => {
    const newAlert: PriceAlert = {
      id: `${symbol}-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      targetPrice,
      condition,
      triggered: false,
      createdAt: new Date().toISOString(),
    };
    saveAlerts([...alerts, newAlert]);
    return newAlert;
  }, [alerts, saveAlerts]);

  const removeAlert = useCallback((id: string) => {
    saveAlerts(alerts.filter(a => a.id !== id));
  }, [alerts, saveAlerts]);

  const checkAlerts = useCallback(async () => {
    const updatedAlerts = [...alerts];
    let hasTriggered = false;

    for (const alert of updatedAlerts) {
      if (alert.triggered) continue;

      try {
        const response = await fetch(`/api/stock/quote?symbol=${alert.symbol}`);
        if (response.ok) {
          const data = await response.json();
          const currentPrice = data.currentPrice;

          if (
            (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
            (alert.condition === "below" && currentPrice <= alert.targetPrice)
          ) {
            alert.triggered = true;
            hasTriggered = true;

            // Show browser notification
            if (Notification.permission === "granted") {
              new Notification(`Price Alert: ${alert.symbol}`, {
                body: `${alert.symbol} is now ${alert.condition} $${alert.targetPrice} (Current: $${currentPrice.toFixed(2)})`,
              });
            }
          }
        }
      } catch (err) {
        console.error(`Error checking alert for ${alert.symbol}:`, err);
      }
    }

    if (hasTriggered) {
      saveAlerts(updatedAlerts);
    }
  }, [alerts, saveAlerts]);

  return { alerts, addAlert, removeAlert, checkAlerts };
};