import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ watchlist: [] }, { status: 200 });
    }

    const watchlist = await prisma.watchlistStock.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ watchlist });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    return NextResponse.json({ watchlist: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

     // Check if already in watchlist
    const existing = await prisma.watchlistStock.findUnique({
      where: {
        userId_symbol: {
          userId: session.user.id,
          symbol: body.symbol
        }
      }
    });

    if (existing) {
      return NextResponse.json({
        success: false,
        error: "Already in watchlist"
      }, { status: 400 });
    }

    const stock = await prisma.watchlistStock.create({
      data: {
        userId: session.user.id,
        symbol: body.symbol,
        name: body.name,
        type: body.type,
        region: body.region
      }
    });

    return NextResponse.json({ success: true, stock });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    await prisma.watchlistStock.deleteMany({
      where: {
        symbol,
        userId: session.user.id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing from watchlist:", error);
    return NextResponse.json({ error: "Failed to remove from watchlist" }, { status: 500 });
  }
}