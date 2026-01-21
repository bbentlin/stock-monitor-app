"use client";

import { useState, useEffect, useRef } from "react";

type PriceDirection = "up" | "down" | null;

export const usePriceFlash = (prices: Record<string, number>) => {
  const [flashes, setFlashes] = useState<Record<string, PriceDirection>>({});
  const prevPricesRef = useRef<Record<string, number>>({});

  useEffect (() => {
    const newFlashes: Record<string, PriceDirection> = {};

    Object.entries(prices).forEach(([symbol, price]) => {
      const prevPrice = prevPricesRef.current[symbol];
      if (prevPrice !== undefined && prevPrice !== price) {
        newFlashes[symbol] = price > prevPrice ? "up" : "down";
      }
    });

    if (Object.keys(newFlashes).length > 0) {
      setFlashes((prev) => ({ ...prev, ...newFlashes }));

      // Clear flashes after animation
      const timeout = setTimeout(() => {
        setFlashes((prev) => {
          const next = { ...prev };
          Object.keys(newFlashes).forEach((symbol) => {
            delete next[symbol];
          });
          return next;
        });
      }, 1000);

      return () => clearTimeout(timeout);
    }

    prevPricesRef.current = { ...prices };
  }, [prices]);

  return flashes;
};