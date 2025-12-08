import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  try {
    const apiKey = process.env.FINNHUB_API_KEY;

    // Get news from last 7 days
    const toDate = new Date().toISOString().split("T")[0];
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    let url = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;

    if (symbol) {
      url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    // Limit to 10 articles
    const articles = (data ||[]).slice(0, 10).map((article: any) => ({
      id: article.id,
      headline: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      datetime: article.datetime,
    }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ articles: [] }, { status: 500 });
  }
}