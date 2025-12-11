import { NextResponse } from "next/server";

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  const cacheKey = symbol.toUpperCase();
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    if (data.c === 0 && data.pc === 0) {
      return NextResponse.json({ error: "Stock not found or no access" }, { status: 404 });
    }

    if (data.c) {
      const result = {
        symbol: symbol.toUpperCase(),
        currentPrice: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc
      };

      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid response from API" }, { status: 500 });
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}