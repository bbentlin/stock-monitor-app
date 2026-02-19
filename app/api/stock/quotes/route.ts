import { NextRequest, NextResponse } from "next/server";

// In-memory cache
const quoteCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");
  const detailed = searchParams.get("detailed") === "true";

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

  const cachePrefix = detailed ? "detailed_" : "";

  // Check cache first
  symbols.forEach((symbol) => {
    const cached = quoteCache.get(cachePrefix + symbol);
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
          const quoteUrl = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
          const quoteRes = await fetch(quoteUrl);
          const data = await quoteRes.json();

          if (!data.c || data.c === 0) return;

          if (detailed) {
            // Fetch profile and metrics in parallel
            const [profileRes, metricsRes] = await Promise.all([
              fetch(`https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${apiKey}`),
              fetch(`https://finnhub.io/api/v1/stock/metric?symbol=${symbol}&metric=all&token=${apiKey}`),
            ]);

            const profile = await profileRes.json();
            const metrics = await metricsRes.json();
            const m = metrics.metric || {};

            const quoteData = {
              symbol,
              name: profile.name || symbol,
              price: data.c,
              change: data.d ?? 0,
              changePercent: data.dp ?? 0,
              marketCap: profile.marketCapitalization ? profile.marketCapitalization * 1e6 : 0,
              peRatio: m.peNormalizedAnnual ?? m.peTTM ?? null,
              dividend: m.dividendYieldIndicatedAnnual ?? 0,
              week52High: m["52WeekHigh"] ?? data.h ?? 0,
              week52Low: m["52WeekLow"] ?? data.l ?? 0,
              volume: data.v ?? 0,
            };

            quotes[symbol] = quoteData;
            quoteCache.set(cachePrefix + symbol, { data: quoteData, timestamp: now });
          } else {
            const quoteData = {
              currentPrice: data.c,
              change: data.d,
              changePercent: data.dp,
            };
            quotes[symbol] = quoteData;
            quoteCache.set(cachePrefix + symbol, { data: quoteData, timestamp: now });
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

  // For detailed mode, return as array for the compare page
  if (detailed) {
    const quotesArray = symbols
      .map((s) => quotes[s])
      .filter(Boolean);
    return NextResponse.json({ quotes: quotesArray });
  }

  return NextResponse.json({ quotes });
}

export async function POST(request: Request) {
  const { symbols } = await request.json();

  if (!symbols || !Array.isArray(symbols)) {
    return NextResponse.json({ error: "Symbols array required" }, { status: 400 });
  }

  const url = new URL(request.url);
  url.searchParams.set("symbols", symbols.join(","));

  const getRequest = new Request(url.toString(), { method: "GET" });
  return GET(getRequest as NextRequest);
}