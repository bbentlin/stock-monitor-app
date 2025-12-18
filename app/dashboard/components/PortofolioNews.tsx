"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Holding } from "@/lib/hooks/useHoldings";

interface NewsArticle {
  id: number;
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  datetime: number;
}

interface PortfolioNewsProps {
  holdings: Holding[];
}

const PortfolioNews: React.FC<Port>