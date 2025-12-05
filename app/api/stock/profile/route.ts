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

    const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol.toUpperCase()}&token=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400});
    }

    // Return empty if no data found
    if (!data.name) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: data.name,
      ticker: data.ticker,
      exchange: data.exchange,
      industry: data.finnhubbIndustry,
      logo: data.logo,
      weburl: data.weburl,
      marketCapitalization: data.marketCapitalization,
      country: data.country,
      ipo: data.ipo,
      shareOutstanding: data.shareOutstanding,
    });
  } catch (error) {
    console.error("Error fetching stock portfolio:", error);
    return NextResponse.json({ error: "Failed to fetch company profile" }, { status: 500 });
  }
}