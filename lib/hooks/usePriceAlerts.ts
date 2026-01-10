"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  triggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = "price_alerts";

export const usePriceAlerts = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const notifiedAlertsRef = useRef<Set<string>>(new Set());

  // Load alerts from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: PriceAlert[] = JSON.parse(stored);
        setAlerts(parsed);
        // Track already triggered alerts to prevent duplicate notifications
        parsed.forEach((alert) => {
          if (alert.triggered) {
            notifiedAlertsRef.current.add(alert.id);
          }
        });
      }
    } catch (err) {
      console.error("Failed to load price alerts:", err);
    }
    setIsLoaded(true);
  }, []);

  // Save alerts to localStorage whenever they change
  const saveAlerts = useCallback((newAlerts: PriceAlert[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newAlerts));
      setAlerts(newAlerts);
    } catch (err) {
      console.error("Failed to save price alerts:", err);
    }
  }, []);

  const addAlert = useCallback(
    (symbol: string, targetPrice: number, condition: "above" | "below") => {
      const newAlert: PriceAlert = {
        id: `${symbol}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
        symbol: symbol.toUpperCase(),
        targetPrice,
        condition, 
        triggered: false,
        createdAt: new Date().toISOString(),
      };
      saveAlerts([...alerts, newAlert]);
      return newAlert;
    },
    [alerts, saveAlerts]
  );

  const removeAlert = useCallback(
    (id: string) => {
      notifiedAlertsRef.current.delete(id);
      saveAlerts(alerts.filter((a) => a.id !== id));
    },
    [alerts, saveAlerts]
  );

  const clearTriggeredAlerts = useCallback(() => {
    const activeAlerts = alerts.filter((a) => !a.triggered);
    alerts
      .filter((a) => a.triggered)
      .forEach((a) => notifiedAlertsRef.current.delete(a.id));
    saveAlerts(activeAlerts);
  }, [alerts, saveAlerts]);

  const resetAlert = useCallback(
    (id: string) => {
      notifiedAlertsRef.current.delete(id);
      const updatedAlerts = alerts.map((alert) => 
        alert.id === id ? { ...alert, triggered: false, triggeredAt: undefined } : alert
      );
      saveAlerts(updatedAlerts);
    },
    [alerts, saveAlerts]
  );

  // Check alerts against real-time prices from WebSocket
  const checkAlertsWithPrices = useCallback(
    (prices: Record<string, number>) => {
      if (!isLoaded || alerts.length === 0) return;

      let hasChanges = false;
      const updatedAlerts = alerts.map((alert) => {
        // Skip already triggered alerts
        if (alert.triggered) return alert;

        const currentPrice = prices[alert.symbol];
        if (currentPrice === undefined) return alert;

        const isTriggered = 
          (alert.condition === "above" && currentPrice >= alert.targetPrice) ||
          (alert.condition === "below" && currentPrice <= alert.targetPrice);

        if (isTriggered && !notifiedAlertsRef.current.has(alert.id)) {
          hasChanges = true;
          notifiedAlertsRef.current.add(alert.id);

          // Show browser notification
          
        }
      })
    }
  );

  // Get symbols that need monitoring
  const getActiveAlertSymbols = useCallback(() => {
    return Array.from(new Set(alerts.filter((a) => !a.triggered).map((a) => a.symbol)));
  }, [alerts]);

  return {
    alerts, 
    addAlert,
    removeAlert,
    checkAlertsWithPrices,
    getActiveAlertSymbols,
  };
};