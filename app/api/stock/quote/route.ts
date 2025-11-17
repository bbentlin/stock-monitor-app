import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  try {
    const apiKey = process.env.FINNHUB_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const url = `https://finnhub.io/api/v1/quote?symbol=${symbol.toUpperCase()}&token=${apiKey}`;

    console.log("Fetching quote for:", symbol);

    const response = await fetch(url);
    const data = await response.json();

    console.log("Quote API Response:", data);
    
    // Check for Finnhub error
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Finnhub returns 0 for all fields if symbol is invalid or no access
    if (data.c === 0 && data.pc === 0) {
      return NextResponse.json({ error: "Stock not found or no access to this symbol" }, { status: 404 });
    }

    // Finnhub returns current price as 'c', previous close as 'pc'
    if (data.c) {
      return NextResponse.json({
        symbol: symbol.toUpperCase(),
        currentPrice: data.c,
        change: data.d,
        changePercent: data.dp,
        high: data.h,
        low: data.l,
        open: data.o,
        previousClose: data.pc
      });
    }

    return NextResponse.json({ error: "Invalid response from API" }, { status: 500 });
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}