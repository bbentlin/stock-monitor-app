"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Holding } from "@/types";

export const useHoldings = () => {
  const { status } = useSession();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const fetchHoldings = useCallback(async () => {
    if (status === "loading") {
      return;
    }

    if (status === "unauthenticated") {
      setIsAuthenticated(false);
      setLoading(false);
      setHoldings([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/holdings");

      if (response.status === 401) {
        setIsAuthenticated(false);
        setHoldings([]);
        return;
      }

      const data = await response.json();
      setHoldings(Array.isArray(data.holdings) ? data.holdings : []);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Error fetching holdings:", err);
      setError("Failed to fetch holdings");
      setHoldings([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchHoldings();
  }, [fetchHoldings]);

  const addHolding = async (holding: Omit<Holding, "id">) => {
    if (!isAuthenticated) {
      setError("Please sign in to add holdings");
      return;
    }

    try {
      const response = await fetch("/api/holdings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(holding),
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (response.ok) {
        await fetchHoldings();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to add holding");
      }
    } catch (err) {
      console.error("Error adding holding:", err);
      setError("Failed to add holding");
    }
  };

  const updateHolding = async (lotId: string, updates: Partial<Holding>) => {
    if (!isAuthenticated) {
      setError("Please sign in to update holdings");
      throw new Error("Not authenticated");
    }

    try {
      const response = await fetch(`/api/holdings`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lotId, ...updates }),
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        throw new Error("Not authenticated");
      }

      if (response.ok) {
        await fetchHoldings();
      } else {
        const data = await response.json();
        throw new Error(data.error || "Failed to update holding");
      }
    } catch (err) {
      console.error("Error updating holding:", err);
      throw err;
    }
  };

  const removeHolding = async (lotId: string) => {
    if (!isAuthenticated) {
      setError("Please sign in to remove holdings");
      return;
    }

    try {
      const response = await fetch(`/api/holdings?lotId=${lotId}`, {
        method: "DELETE",
      });

      if (response.status === 401) {
        setIsAuthenticated(false);
        return;
      }

      if (response.ok) {
        await fetchHoldings();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to remove holding");
      }
    } catch (err) {
      console.error("Error removing holding:", err);
      setError("Failed to remove holding");
    }
  };

  return {
    holdings,
    loading: loading || status === "loading",
    error,
    isAuthenticated,
    addHolding,
    updateHolding,
    removeHolding,
    refreshHoldings: fetchHoldings,
  };
};