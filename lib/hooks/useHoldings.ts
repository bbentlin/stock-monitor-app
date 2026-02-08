"use client";

import useSWR from "swr";
import { Holding } from "@/types";
import { useSession } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const useHoldings = () => {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const { data, error, isLoading, mutate } = useSWR<{ holdings: Holding[] }>(
    isAuthenticated ? "/api/holdings" : null,
    fetcher,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 5000,
    }
  );

  const holdings = data?.holdings ?? [];

  // Optimistic add
  const addHolding = async (holding: Omit<Holding, "lotId">) => {
    const optimisticHolding = {
      ...holding,
      lotId: `temp-${Date.now()}`,
      value: holding.shares * (holding.currentPrice ?? holding.purchasePrice),
    };

    mutate(
      { holdings: [...holdings, optimisticHolding] },
      false
    );

    try {
      const response = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holding),
      });

      if (!response.ok) throw new Error("Failed to add holding");
      mutate();
    } catch (error) {
      mutate(); // Rollback
      throw Error;
    }
  };

  // Optimistic remove
  const removeHolding = async (lotId: string) => {
    mutate(
      { holdings: holdings.filter((h) => h.lotId !== lotId) },
      false
    );

    try {
      const response = await fetch("/api/holdings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotId }),
      });

      if (!response.ok) throw new Error("Failed to remove holding");
      mutate();
    } catch (error) {
      mutate();
      throw error;
    }
  };

  // Optimistic update
  const updateHolding = async (lotId: string, updates: Partial<Holding>) => {
    mutate(
      {
        holdings: holdings.map((h) => 
          h.lotId === lotId ? { ...h, ...updates }: h
        ),
      },
      false
    );

    try {
      const response = await fetch("/api/holdings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotId, ...updates }),
      });

      if (!response.ok) throw new Error("Failed to update holding");
      mutate();
    } catch (error) {
      mutate();
      throw error;
    }
  };

  return {
    holdings,
    loading: isLoading,
    error,
    isAuthenticated,
    addHolding,
    removeHolding,
    updateHolding,
    refresh: mutate,
  };
};