export interface Holding {
  id?: string;
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  change?: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  lotId: string;
  purchaseDate?: string;
}

export interface WatchlistStock {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

export interface StockQuote {
  symbol: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: "above" | "below";
  triggered: boolean;
  triggeredAt?: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
  status?: number;
}