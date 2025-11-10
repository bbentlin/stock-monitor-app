import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  try {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keyword=${query}&apikey=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.bestMatches) {
      const results = data.bestMatches.map((match: any) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        type: match["3. type"],
        region: match["4. region"]
      }));

      return NextResponse.json({ results });
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error("Error searching stocks:", error);
    return NextResponse.json({ error: "Failed to search stocks" }, { status: 500 });
  }
}