import { NextRequest, NextResponse } from "next/server";
import * as storage from "@/lib/db/storage";
import { watch } from "fs";

export async function GET() {
  const watchlist = storage.getWatchlist();
  return NextResponse.json({ watchlist });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const watchlist = storage.getWatchlist();

    // Check if already in watchlist
    if (watchlist.find(s => s.symbol === body.symbol)) {
      return NextResponse.json({ success: false, error: "Already in watchlist" }, { status: 400 })
    }

    const updatedWatchlist = storage.addToWatchlist(body);
    return NextResponse.json({ success: true, stock: body, watchlist: updatedWatchlist });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add to watchlist" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    const watchlist = storage.removeFromWatchlist(symbol);
    return NextResponse.json({ success: true, watchlist });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove from watchlist"}, { status: 500 });
  }
}