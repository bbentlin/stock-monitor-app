import { NextResponse } from "next/server";

// Mock database - replace with actual database later
let holdings = [
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    shares: 10,
    purchasePrice: 150.00,
    currentPrice: 175.50,
    value: 1755.00,
    gainLoss: 255.00,
    gainLossPercent: 17.0
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    shares: 5,
    purchasePrice: 300.00,
    currentPrice: 350.25,
    value: 1751.25,
    gainLoss: 251.25,
    gainLossPercent: 16.75
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc.",
    shares: 8,
    purchasePrice: 120.00,
    currentPrice: 135.80,
    value: 1086.40,
    gainLoss: 126.40,
    gainLossPercent: 13.17
  }
];

export async function GET() {
  return NextResponse.json({ holdings });
}

export async function POST(request: Request) {
  const body = await request.json();
  holdings.push(body);
  return NextResponse.json({ success: true, holding: body });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");

  holdings = holdings.filter(h => h.symbol !== symbol);
  return NextResponse.json({ success: true });
}