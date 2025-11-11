import { NextResponse } from "next/server";

// Mock database - replace with actual database later
let watchlist = [
  {
    symbol: "TSLA",
    name: "Tesla, Inc.",
    type: "Equity",
    region: "United States"
  },
  {
    symbol: "NVDA",
    name: "NVIDIA Corporation",
    type: "Equity",
    region: "United States"
  }
];

export async function GET() {
  return NextResponse.json({ watchlist });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Check if already in watchlist
  if (watchlist.find(s => s.symbol === body.symbol)) {
    return NextResponse.json({ success: false, error: "Already in watchlist" }, { status: 400 });
  }

  watchlist.push(body);
  return NextResponse.json({ success: true, stock: body });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  watchlist = watchlist.filter(s => s.symbol !== symbol);
  return NextResponse.json({ success: true });
}