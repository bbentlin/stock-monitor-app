import { NextResponse } from "next/server";

// In-memory cache for news
const newsCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const cacheKey = symbol || "general";

  // Check cache
  const cached = newsCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json({ articles: cached.data });
  }

  const apiKey = process.env.FINNHUB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { articles: [], error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const toDate = new Date().toISOString().split("T")[0];
    const fromDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    let url = `https://finnhub.io/api/v1/news?category=general&token=${apiKey}`;

    if (symbol) {
      url = `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${fromDate}&to=${toDate}&token=${apiKey}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Finnhub API returned ${response.status}`);
    }

    const data = await response.json();

    const articles = (data || []).slice(0, 10).map((article: any) => ({
      id: article.id || `${article.datetime}-${article.headline?.slice(0, 10)}`,
      headline: article.headline,
      summary: article.summary,
      source: article.source,
      url: article.url,
      image: article.image,
      datetime: article.datetime,
    }));

    // Cache the result
    newsCache.set(cacheKey, { data: articles, timestamp: Date.now() });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Error fetching news:", error);
    return NextResponse.json({ articles: [], error: "Failed to fetch news" }, { status: 500 });
  }
}