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

  // Cache to prevent duplicate API calls
  const lastFetchTimeRef = useRef<Record<string, number>>({});
  const pendingFetchRef = useRef<Promise<void | null>>(null);
  const fetchQueueRef = useRef<Set<string>>(new Set());
  const fetchDebounceRef = useRef<NodeJS.Timeout>(null);

  const MAX_RECONNECT_ATTEMPTS = 5;
  const RECONNECT_DELAY = 5000;
  const CACHE_TTL = 60000; // 1 minute cache for REST API prices
  const FETCH_DEBOUNCE = 500 // Wait 500ms to batch requests

  // Debounced fetch - collects symbols and fetches once
  const fetchFallbackPrices = useCallback(async (symbols: string[]) => {
    if (symbols.length === 0) return;

    const now = Date.now();

    // Filter out symbols that were fetched recently
    const symbolsToFetch = symbols.filter((symbol) => {
      const lastFetch = lastFetchTimeRef.current[symbol];
      return !lastFetch || now - lastFetch > CACHE_TTL;
    });

    if (symbolsToFetch.length === 0) {
      console.log("All symbols cached, skipping fetch");
      return;
    }

    // Add to queue
    symbolsToFetch.forEach((s) => fetchQueueRef.current.add(s));

    // Debounce the actual fetch
    if (fetchDebounceRef.current) {
      clearTimeout(fetchDebounceRef.current);
    }

    fetchDebounceRef.current = setTimeout(async () => {
      const queuedSymbols = Array.from(fetchQueueRef.current);
      fetchQueueRef.current.clear();

      if (queuedSymbols.length === 0) return;

      console.log("Fetching prices for:", queuedSymbols.join(","));

      try {
        const response = await fetch(`/api/stock/quotes?symbols=${queuedSymbols.join(",")}`);
        if (response.ok) {
          const data = await response.json();
          if (data.quotes) {
            const newPrices: Record<string, number> = {};
            const fetchTime = Date.now();

            Object.entries(data.quotes).forEach(([symbol, quote]: [string, any]) => {
              if (quote?.currentPrice) {
                newPrices[symbol] = quote.currentPrice;
                lastFetchTimeRef.current[symbol] = fetchTime;
              }
            });

            if (Object.keys(newPrices).length > 0) {
              console.log("Fallback prices fetched:", Object.keys(newPrices).length, "symbols");
              setPrices((prev) => ({ ...prev, ...newPrices }));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching fallback prices:", err);
      }
    }, FETCH_DEBOUNCE);
  }, []);

  const connect = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    if (!apiKey) {
      setError("WebSocket API key not configured");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
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

        // Fetch initial prices via REST as fallback (once, debounced)
        if (symbolsToSubscribe.length > 0) {
          fetchFallbackPrices(symbolsToSubscribe);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

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
                // Update cache time since we got fresh data
                lastFetchTimeRef.current[symbol] = Date.now();
              }
            );

            setPrices((prev) => ({ ...prev, ...newPrices }));
            setLastTrades((prev) => ({ ...prev, ...newTrades }));
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = () => {
        console.warn("WebSocket connection failed - using REST API fallback");
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

        // Only fetch fallback if we don't have prices
        const symbolsToFetch = Array.from (pendingSubscriptionsRef.current).filter(
          (s) => !prices[s]
        );
        if (symbolsToFetch.length > 0) {
          fetchFallbackPrices(symbolsToFetch);
        }

        if (!event.wasClean && reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttemptsRef.current++;
          reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError("Failed to create WebSocket connection");
    }
  }, [fetchFallbackPrices, prices]);

  const subscribe = useCallback((symbols: string[]) => {
    const newSymbols: string[] = [];

    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();

      // Skip if already subscribed or pending
      if (subscribedSymbolsRef.current.has(upperSymbol) || pendingSubscriptionsRef.current.has(upperSymbol)) {
        return;
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "subscribe", symbol: upperSymbol }));
        subscribedSymbolsRef.current.add(upperSymbol);
      } else {
        pendingSubscriptionsRef.current.add(upperSymbol);
        connect();
      }

      newSymbols.push(upperSymbol);
    });

    // Only fetch for symbols we don't have cached prices for
    const symbolsNeedingFetch = newSymbols.filter((s) => !prices[s]);
    if (symbolsNeedingFetch.length > 0) {
      fetchFallbackPrices(symbolsNeedingFetch);
    }
  }, [connect, fetchFallbackPrices, prices]);

  const unsubscribe = useCallback((symbols: string[]) => {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();

      if (
        wsRef.current?.readyState === WebSocket.OPEN && 
        subscribedSymbolsRef.current.has(upperSymbol)
      ) {
        wsRef.current.send(JSON.stringify({ type: "unsubscribe", symbol: upperSymbol }));
        subscribedSymbolsRef.current.delete(upperSymbol);
      }

      pendingSubscriptionsRef.current.delete(upperSymbol);
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (fetchDebounceRef.current) clearTimeout(fetchDebounceRef.current);
      if (wsRef.current) wsRef.current.close();
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