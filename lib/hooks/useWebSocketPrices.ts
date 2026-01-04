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
    V: number; // volume
  }>;
}

export const useWebSocketPrices = {symbols: string[]} => {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [lastTrades, setLastTrades] = useState<Record<string, Trade>>({});
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
}