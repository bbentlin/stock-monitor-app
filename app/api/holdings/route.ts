import { NextResponse } from "next/server";
import * as storage from "@/lib/db/storage";

export async function GET() {
  const holdings = storage.getHoldings();
  return NextResponse.json({ holdings });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const holdings = storage.addHolding(body);
    return NextResponse.json({ success: true, holding: body, holdings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to add holding" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Symbol required" }, { status: 400 });
    }

    const holdings = storage.removeHolding(symbol);
    return NextResponse.json({ success: true, holdings });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove holding" }, { status: 500 });
  }
}