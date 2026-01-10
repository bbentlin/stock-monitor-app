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
  const subscribedSymbolsRef = useRef<Set<string>>(new Set());
  const pendingSubscriptionsRef = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

    if (!apiKey) {
      setError("WebSocket API key not configured. Add NEXT_PUBLIC_FINNHUB_API_KEY to your .env.local");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    try {
      const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
        setError(null);

        // Subscribe to pending symbols
        pendingSubscriptionsRef.current.forEach((symbol) => {
          ws.send(JSON.stringify({ type: "subscribe", symbol }));
          subscribedSymbolsRef.current.add(symbol);
        });
        pendingSubscriptionsRef.current.clear();
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          if (message.type === "trade" && message.data) {
            const updates: Record<string, number> = {};
            const tradeUpdates: Record<string, Trade> = {};

            message.data.forEach((trade: { s: string; p: number; t: number; v: number }) => {
              updates[trade.s] = trade.p;
              tradeUpdates[trade.s] = {
                symbol: trade.s,
                price: trade.p,
                timestamp: trade.t,
                volume: trade.v,
              };
            });

            setPrices((prev) => ({ ...prev, ...updates }));
            setLastTrades((prev) => ({ ...prev, ...tradeUpdates }));
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = () => {
        console.error("WebSocket error");
        setError("WebSocket connection error");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code);
        setConnected(false);

        // Move subscribed symbols to pending for reconnection
        subscribedSymbolsRef.current.forEach((symbol) => {
          pendingSubscriptionsRef.current.add(symbol);
        });
        subscribedSymbolsRef.current.clear();

        // Attempt to reconnect after 5 seconds
        if (!event.wasClean) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log("Attempting to reconnect...");
            connect();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      console.error("Error creating WebSocket:", err);
      setError("Failed to create WebSocket connection");
    }
  }, []);

  const subscribe = useCallback((symbols: string[]) => {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();

      if (subscribedSymbolsRef.current.has(upperSymbol)) {
        return; // Already subscribed
      }

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "subscribe", symbol: upperSymbol }));
        subscribedSymbolsRef.current.add(upperSymbol);
      } else {
        pendingSubscriptionsRef.current.add(upperSymbol);
        // Ensure connection is established
        connect();
      }
    });
  }, [connect]);

  const unsubscribe = useCallback((symbols: string[]) => {
    symbols.forEach((symbol) => {
      const upperSymbol = symbol.toUpperCase();

      if (wsRef.current?.readyState === WebSocket.OPEN && subscribedSymbolsRef.current.has(upperSymbol)) {
        wsRef.current.send(JSON.stringify({ type: "unsubscribe", symbol: upperSymbol }));
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