import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  if (!symbol) {
    return NextResponse.json({ error: "Symbol required"    }, { status: 400 });
  }

  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTES&symbol=${symbol}&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data["Global Quote"]) {
      const quote = data["Global Quote"];
      return NextResponse.json({
        symbol: quote["01. symbol"],
        price: parseFloat(quote["05. price"]),
        change: parseFloat(quote["09. change"]),
        changePercent: quote["10. change percent"]
      });
    }

    return NextResponse.json({ error: "Stock not found" }, { status: 404 });
  } catch (error) {
    console.error("Error fetching stock quote:", error);
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 });
  }
}