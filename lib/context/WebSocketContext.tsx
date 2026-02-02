"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

interface Trade {
  symbol: string;
  price: number;
  timestamp: number;
  volume: number;
}

interface WebSocketContextType {
  prices: Record<string, number>;
  lastTrades: Record<string, Trade>;
  connected: boolean;
  error: string | null;
  subscribe: (symbols: string[]) => void;
  unsubscribe: (symbols: string[]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastTrades, setLastTrades] = useState<Record<string, Trade>>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const subscribedSymbolsRef = useRef<Set<string>>(new Set());
  const pendingSubscriptionsRef = useRef<Set<string>>(new Set());

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 5000;

  // Fallback: Fetch prices via REST API for symbols without WebSocket data
  const fetchFallbackPrices = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return;

    try {
      const response = await fetch(`/api/stock/quotes?symbols=${symbols.join(",")}`);
      if (response.ok) {
        const data = await response.json();
        if (data.quotes) {
          const newPrices: Record<string, number> = {};
          Object.entries(data.quotes).forEach(([symbol, quote]: [string, any]) => {
            // Fix: use currentPrice instead of c
            if (quote?.currentPrice) {
              newPrices[symbol] = quote.currentPrice;
            }
          });
          if (Object.keys(newPrices).length > 0) {
            console.log("Fallback prices fetched:", newPrices);
            setPrices((prev) => ({ ...prev, ...newPrices }));
          }
        }
      }
    } catch (err) {
      console.error("Error fetching fallback prices:", err);
    }
  }, []);

  const connect = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    if (!apiKey) {
      setError("WebSocket API key not configured. Add NEXT_PUBLIC_FINNHUB_API_KEY to your .env.local");
      return;
    }

    try {
      const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

      ws.onopen = () => {
        console.log("WebSocket Connected!");
        setConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // Subscribe to pending symbols
        const symbolsToSubscribe: string[] = [];
        pendingSubscriptionsRef.current.forEach((symbol) => {
          ws.send(JSON.stringify({ type: "subscribe", symbol }));
          subscribedSymbolsRef.current.add(symbol);
          symbolsToSubscribe.push(symbol);
        });
        pendingSubscriptionsRef.current.clear();

        console.log("Subscribed to symbols:", symbolsToSubscribe);

        // Fetch initial prices via REST as fallback
        if (symbolsToSubscribe.length > 0) {
          fetchFallbackPrices(symbolsToSubscribe);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          // Debug: log all messages
          if (message.type === "ping") {
            console.log("WebSocket ping received");
          } else if (message.type === "trade") {
            console.log("Trade data received:", message.data?.length, "trades");
          }

          if (message.type === "trade" && message.data) {
            const newPrices: Record<string, number> = {};
            const newTrades: Record<string, Trade> = {};

            message.data.forEach(
              (trade: { s: string; p: number; t: number; v: number }) => {
                const symbol = trade.s;
                newPrices[symbol] = trade.p;
                newTrades[symbol] = {
                  symbol,
                  price: trade.p,
                  timestamp: trade.t,
                  volume: trade.v,
                };
              }
            );

            console.log("Price update:", newPrices);
            setPrices((prev) => ({ ...prev, ...newPrices }));
            setLastTrades((prev) => ({ ...prev, ...newTrades }));
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = () => {
        console.warn("WebSocket connection failed - using REST API fallback");
        // Don't show error to user if we have fallback prices
        if (Object.keys(prices).length === 0) {
          setError("Live prices unavailable - showing delayed quotes");
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code);
        setConnected(false);
        wsRef.current = null;

        // Move subscribed symbols to pending for reconnection
        subscribedSymbolsRef.current.forEach((symbol) => {
          pendingSubscriptionsRef.current.add(symbol);
        });
        subscribedSymbolsRef.current.clear();

        // Fetch fallback prices when WebSocket closes
        const symbolsToFetch = Array.from(pendingSubscriptionsRef.current);
        if (symbolsToFetch.length > 0) {
          fetchFallbackPrices(symbolsToFetch);
        }

        // Attempt to reconnect if not a clean close
        if (!event.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          console.log(
            `Attempting to reconnect (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`
          );
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          // Don't show error if fallback is working
          if (Object.keys(prices).length === 0) {
            setError("Live updates unavailable");
          }
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError("Failed to create WebSocket connection");
    }
  }, [fetchFallbackPrices]);

  const subscribe = useCallback((symbols: string[]) => {
    const newSymbols: string[] = [];

    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();

      if (subscribedSymbolsRef.current.has(upperSymbol)) {
        return; // Already subscribed
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "subscribe", symbol: upperSymbol }));
        subscribedSymbolsRef.current.add(upperSymbol);
        newSymbols.push(upperSymbol);
      } else {
        pendingSubscriptionsRef.current.add(upperSymbol);
        newSymbols.push(upperSymbol);
        // Ensure connection is established
        connect();
      }
    });

    // Immediately fetch prices via REST for new subscriptions
    if (newSymbols.length > 0) {
      console.log("New subscriptions:", newSymbols);
      fetchFallbackPrices(newSymbols);
    }
  }, [connect, fetchFallbackPrices]);

  const unsubscribe = useCallback((symbols: string[]) => {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();

      if (
        wsRef.current?.readyState === WebSocket.OPEN && 
        subscribedSymbolsRef.current.has(upperSymbol)
      ) {
        wsRef.current.send(
          JSON.stringify({ type: "unsubscribe", symbol: upperSymbol })
        );
        subscribedSymbolsRef.current.delete(upperSymbol);
      }

      pendingSubscriptionsRef.current.delete(upperSymbol);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        prices,
        lastTrades,
        connected,
        error,
        subscribe,
        unsubscribe,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};