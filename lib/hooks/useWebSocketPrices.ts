"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface Trade {
  symbol: string;
  price: number;
  timestamp: number;
  volume: number;
}

interface WebSocketMessage {
  type: string;
  data?: Array<{
    s: string; // symbol
    p: number; // price
    t: number; // timestamp
    v: number; // volume
  }>;
}

export const useWebSocketPrices = (symbols: string[]) => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastTrades, setLastTrades] = useState<Record<string, Trade>>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const subscribedSymbolsRef = useRef<Set<string>>(new Set());

  const connect = useCallback(() => {
    const apiKey = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
    
    if (!apiKey) {
      setError("WebSocket API key not configured");
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(`wss://ws.finnhub.io?token=${apiKey}`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setConnected(true);
        setError(null);

        // Subscribe to all symbols
        symbols.forEach((symbol) => {
          if (!subscribedSymbolsRef.current.has(symbol)) {
            ws.send(JSON.stringify({ type: "subscribe", symbol: symbol.toUpperCase() }));
            subscribedSymbolsRef.current.add(symbol);
          }
        });
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          if (message.type === "trade" && message.data) {
            const updates: Record<string, number> = {};
            const tradeUpdates: Record<string, Trade> = {};

            message.data.forEach((trade) => {
              const symbol = trade.s;
              updates[symbol] = trade.p;
              tradeUpdates[symbol] = {
                symbol,
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

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("WebSocket connection error");
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        setConnected(false);
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
  }, [symbols]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      // Unsubscribe from all symbols
      subscribedSymbolsRef.current.forEach((symbol) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ type: "unsubscribe", symbol }));
        }
      });

      wsRef.current.close();
      wsRef.current = null;
    }

    subscribedSymbolsRef.current.clear();
    setConnected(false);
  }, []);

  const subscribe = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    if (wsRef.current?.readyState === WebSocket.OPEN && !subscribedSymbolsRef.current.has(upperSymbol)) {
      wsRef.current.send(JSON.stringify({ type: "subscribe", symbol: upperSymbol }));
      subscribedSymbolsRef.current.add(upperSymbol);
    }
  }, []);

  const unsubscribe = useCallback((symbol: string) => {
    const upperSymbol = symbol.toUpperCase();
    if (wsRef.current?.readyState === WebSocket.OPEN && subscribedSymbolsRef.current.has(upperSymbol)) {
      wsRef.current.send(JSON.stringify({ type: "unsubscribe", symbol: upperSymbol }));
      subscribedSymbolsRef.current.delete(upperSymbol);
    }
  }, []);

  // Connect when symbols change
  useEffect(() => {
    if (symbols.length === 0) {
      disconnect();
      return;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [symbols.length]); // Only reconnect when symbol count changes

  // Subscribe to new symbols when they're added
  useEffect(() => {
    if (!connected) return;

    symbols.forEach((symbol) => {
      subscribe(symbol);
    });

    // Unsubscribe from removed symbols
    subscribedSymbolsRef.current.forEach((symbol) => {
      if (!symbols.includes(symbol)) {
        unsubscribe(symbol);
      }
    });
  }, [symbols, connected, subscribe, unsubscribe]);

  return {
    prices,
    lastTrades,
    connected,
    error,
    subscribe,
    unsubscribe,
    reconnect: connect,
  };
};