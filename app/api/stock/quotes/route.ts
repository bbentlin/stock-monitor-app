import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { symbols } = await request.json();

    if (!symbols || !Array.isArray(symbols)) {
      return NextResponse.json({ error: "Symbols array required" }, { status: 400 });
    }

    const apiKey = process.env.FINNHUB_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const quotes: Record<string, any> = {};

    // Fetch in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize);
      const promises = batch.map(async (symbol: string) => {
        const url = `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.c && data.c !== 0) {
          quotes[symbol.toUpperCase()] = {
            currentPrice: data.c,
            change: data.d,
            changePercent: data.dp,
          };
        }
      });

      await Promise.all(promises);

      // Rate limit delay between batches
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }

    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Error fetching quotes:", error);
    return NextResponse.json({ error: "Failed to fetch quotes" }, { status: 500 });
  }
}

// Add GET handler for WebSocket fallback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");

  if (!symbolsParam) {
    return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
  }

  const symbols = symbolsParam.split(",").map((s) => s.trim());
  
  // Reuse the same logic as POST
  const apiKey = process.env.FINNHUB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 500 });
  }

  const quotes: Record<string, any> = {};
  const batchSize = 5;

  for (let i = 0; i < symbols.length; i += batchSize) {
    const batch = symbols.slice(i, i + batchSize);
    const promises = batch.map(async (symbol: string) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.c && data.c !== 0) {
        quotes[symbol.toUpperCase()] = {
          currentPrice: data.c,
          change: data.d,
          changePercent: data.dp,
        };
      }
    });

    await Promise.all(promises);

    if (i + batchSize < symbols.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  return NextResponse.json({ quotes });
}