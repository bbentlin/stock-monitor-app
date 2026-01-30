"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PortfolioQuickStats from "./PortfolioQuickStats";
import { Holding } from "@/types";

const HeaderStats: React.FC = () => {
  const { data: session, status } = useSession();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHoldings = async () => {
      if (status !== "authenticated") {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/holdings");
        if (response.ok) {
          const data = await response.json();
          setHoldings(data);
        }
      } catch (error) {
        console.error("Failed to fetch holdings for header:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHoldings();
  }, [status]);

  if (status !== "authenticated" || loading || holdings.length === 0) {
    return null;
  }

  return <PortfolioQuickStats holdings={holdings} />;
};

export default HeaderStats;