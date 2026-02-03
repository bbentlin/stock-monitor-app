import { NextRequest, NextResponse } from "next/server";

// In-memory cache
const quoteCache = new Map<string, { data: any; timestamp: number}>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
    return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
  }

  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase());
  const quotes: Record<string, any> = {};
  const symbolsToFetch: string[] = [];
  const now = Date.now();

  // Check cache first
  symbols.forEach((symbol) => {
    const cached = quoteCache.get(symbol);
    if (cached && now - cached.timestamp < CACHE_TTL) {
      quotes[symbol] = cached.data;
    } else {
      symbolsToFetch.push(symbol);
    }
  });

  // Only fetch uncached symbols
  if (symbolsToFetch.length > 0) {
    const batchSize = 5;

    for (let i = 0; i < symbolsToFetch.length; i += batchSize) {
      const batch = symbolsToFetch.slice(i, i + batchSize);
      const promises = batch.map(async (symbol: string) => {
        try {
          const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.c && data.c !== 0) {
            const quoteData = {
              currentPrice: data.c,
              change: data.d,
              changePercent: data.dp,
            };
            quotes[symbol] = quoteData;
            quoteCache.set(symbol, { data: quoteData, timestamp: now });
          }
        } catch (err) {
          console.error(`Error fetching quote for ${symbol}:`, err);
        }
      });

      await Promise.all(promises);

      if (i + batchSize < symbolsToFetch.length) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    }
  }

  console.log(`Quotes: ${symbols.length} requested, ${symbolsToFetch.length} fetched, ${symbols.length - symbolsToFetch.length} cached`);

  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  const { symbols } = await request.json();

  if (!symbols || !Array.isArray(symbols)) {
    return NextResponse.json({ error: "Symbols array required" }, { status: 400 });
  }

  // Redirect to GET handler logic
  const url = new URL(request.url);
  url.searchParams.set("symbols", symbols.join(","));

  const getRequest = new Request(url.toString(), { method: "GET" });
  return GET(getRequest as NextRequest);
}