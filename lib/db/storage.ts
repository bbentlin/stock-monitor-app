import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const HOLDINGS_FILE = path.join(DATA_DIR, "holdings.json");
const WATCHLIST_FILE = path.join(DATA_DIR, "watchlist.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
  currentPrice: number;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  purchaseDate?: string;
  lotId: string; // Unique identifier for each purchase
}

export interface WatchlistStock {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

// Holdings storage
export const getHoldings = (): Holding[] => {
  try {
    if (!fs.existsSync(HOLDINGS_FILE)) {
      return [];
    }
    const data = fs.readFileSync(HOLDINGS_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading holdings:", error);
    return [];
  }
};

export const saveHoldings = (holdings: Holding[]): void => {
  try {
    fs.writeFileSync(HOLDINGS_FILE, JSON.stringify(holdings, null, 2));
  } catch (error) {
    console.error("Error saving holdings:", error);
    throw error;
  }
};

export const addHolding = (holding: Holding): Holding[] => {
  const holdings = getHoldings();

  // Generate unique lot ID if not provided
  if (!holding.lotId) {
    holding.lotId = `${holding.symbol}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  holdings.push(holding);
  saveHoldings(holdings);
  return holdings;
};

export const removeHolding = (lotId: string): Holding[] => {
  const holdings = getHoldings().filter(h => h.lotId !== lotId);
  saveHoldings(holdings);
  return holdings;
};

// Watchlist storage
export const getWatchlist = (): WatchlistStock[] => {
  try {
    if (!fs.existsSync(WATCHLIST_FILE)) {
      return [];
    }
    const data = fs.readFileSync(WATCHLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading watchlist:", error);
    return [];
  }
};

export const saveWatchlist = (watchlist: WatchlistStock[]): void => {
  try {
    fs.writeFileSync(WATCHLIST_FILE, JSON.stringify(watchlist, null, 2));
  } catch (error) {
    console.error("Error saving watchlist:", error);
    throw error;
  } 
};

export const addToWatchlist = (stock: WatchlistStock): WatchlistStock[] => {
  const watchlist = getWatchlist();
  if (!watchlist.find(s => s.symbol === stock.symbol)) {
    watchlist.push(stock);
    saveWatchlist(watchlist);
  }
  return watchlist;
};

export const removeFromWatchlist = (symbol: string): WatchlistStock[] => {
  const watchlist = getWatchlist().filter(s => s.symbol !== symbol);
  saveWatchlist(watchlist);
  return watchlist;
};