import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY;

// Simple in-memory cache for quotes
const quoteCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute

async function fetchQuote(symbol: string) {
  const cached = quoteCache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const res = await fetch(`https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_KEY}`);
    const data = await res.json();

    if (data.c && data.c > 0) {
      const quote = {
        currentPrice: data.c,
        change: data.d,
        changePercent: data.dp,
        previousClose: data.pc,
      };
      quoteCache.set(symbol, { data: quote, timestamp: Date.now() });
      return quote;
    }
  } catch (err) {
    console.error(`Failed to fetch quote for ${symbol}:`, err);
  }

  return null;
}

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const holdings = await prisma.holding.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" } 
    });

    // Get unique symbols
    const symbols = [...new Set(holdings.map((h) => h.symbol))];

    // Fetch live quotes for all symbols
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        const quote = await fetchQuote(symbol);
        return { symbol, quote };
      })
    );

    const quoteMap = new Map(
      quotes
        .filter((q) => q.quote !== null)
        .map((q) => [q.symbol, q.quote])
    );

    // Enrich holdings with live data
    const enrichedHoldings = holdings.map((h) => {
      const quote = quoteMap.get(h.symbol);
      const currentPrice = quote?.currentPrice ?? h.currentPrice ?? h.purchasePrice;
      const change = quote?.change ?? 0;
      const value = h.shares * currentPrice;
      const costBasis = h.shares * h.purchasePrice;
      const gainLoss = value - costBasis;
      const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

      return {
        ...h,
        currentPrice,
        change,
        value,
        gainLoss,
        gainLossPercent,
      };
    });

    return NextResponse.json({ holdings: enrichedHoldings });
  } catch (error) {
    console.error("Error fetching holdings:", error);
    return NextResponse.json({ error: "Failed to fetch holdings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.symbol || !body.name || !body.shares || !body.purchasePrice) {
      return NextResponse.json(
        { error: "Missing required fields: symbol, name, shares, purchasePrice" },
        { status: 400 }
      );
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please sign out and sign back in." },
        { status: 404 }
      );
    }

    const quote = await fetchQuote(body.symbol);
    const currentPrice = quote?.currentPrice ?? body.purchasePrice;
    const value = body.shares * currentPrice;
    const costBasis = body.shares * body.purchasePrice;
    const gainLoss = value - costBasis;
    const gainLossPercent = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;

    console.log("Creating holding with:", {
      userId: session.user.id,
      symbol: body.symbol.toUpperCase(),
      name: body.name,
      shares: body.shares,
      purchasePrice: body.purchasePrice,
      currentPrice,
      value,
      gainLoss,
      gainLossPercent,
    });

    const holding = await prisma.holding.create({
      data: {
        userId: session.user.id,
        symbol: body.symbol.toUpperCase(),
        name: body.name,
        shares: parseFloat(body.shares),
        purchasePrice: parseFloat(body.purchasePrice),
        currentPrice,
        value,
        gainLoss,
        gainLossPercent,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        holding: { ...holding, change: quote?.change ?? 0 },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding holding:", error);
    return NextResponse.json(
      { error: "Failed to add holding", details: String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { lotId, shares, purchasePrice, purchaseDate } = body;

    if (!lotId) {
      return NextResponse.json({ error: "lotId is required" }, { status: 400 });
    }

    // Verify the holding belongs to this user
    const existing = await prisma.holding.findFirst({
      where: { lotId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Holding not found" }, { status: 400 });
    }

    // Calculate updated values
    const newShares = shares ?? existing.shares;
    const newPurchasePrice = purchasePrice ?? existing.purchasePrice;
    const newValue = newShares * existing.currentPrice;
    const costBasis = newShares * newPurchasePrice;
    const newGainLoss = newValue - costBasis;
    const newGainLossPercent = costBasis > 0 ? (newGainLoss / costBasis) * 100 : 0;

    const holding = await prisma.holding.update({
      where: { id: existing.id },
      data: {
        shares: newShares,
        purchasePrice: newPurchasePrice,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : existing.purchaseDate,
        value: newValue,
        gainLoss: newGainLoss,
        gainLossPercent: newGainLossPercent,
      }
    });

    return NextResponse.json({ success: true, holding });
  } catch (error) {
    console.error("Error updating holding:", error);
    return NextResponse.json({ error: "Failed to update holding" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const lotId = searchParams.get("lotId");

    if (!lotId) {
      return NextResponse.json({ error: "lotId is required "}, { status: 400 });
    }

    // Verify the holding belongs to this user
    const existing = await prisma.holding.findFirst({
      where: { lotId, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Holding not found" }, { status: 404 });
    }

    await prisma.holding.delete({
      where: { id: existing.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing holding:", error);
    return NextResponse.json({ error: "Failed to remove holding" }, { status: 500 });
  }
}

