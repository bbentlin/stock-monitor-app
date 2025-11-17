import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");

  if (!query) {
    return NextResponse.json({ error: "Query required" }, { status: 400 });
  }

  try {
    const apiKey = process.env.FINNHUB_API_KEY;
    const url = `https://finnhub.io/api/v1/search?q=${query}&token=${apiKey}`;

    console.log("Searching for:", query);

    const response = await fetch(url);
    const data = await response.json();

    console.log("API Response:", data);

    // Finnhub returns an error property if something goes wrong
    if (data.error) {
      return NextResponse.json({
        error: data.error,
        results: []
      }, { status: 400 });
    }    

    if (data.result) {
      const results = data.result.map((match: any) => ({
        symbol: match.symbol,
        name: match.description,
        type: match.type,
        region: "United States" // Finnhub doesn't return region directly
      }));

      // Remove duplicates by symbol
      const uniqueResults = results.filter((stock: any, index: number, self: any[]) =>
        index === self.findIndex((s) => s.symbol === stock.symbol)
      );

      return NextResponse.json({ results: uniqueResults });
    }

    return NextResponse.json({ results: [] });
  } catch (error) {
    console.error("Error searching stocks:", error);
    return NextResponse.json({ error: "Failed to search stocks"}, { status: 500 });
  }
}