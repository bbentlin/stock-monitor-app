import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const holdings = await prisma.holding.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return NextResponse.json({ holdings });
}

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const holding = await prisma.holding.create({
      data: {
        userId: session.user.id,
        symbol: body.symbol,
        name: body.name,
        shares: body.shares,
        purchasePrice: body.purchasePrice,
        currentPrice: body.currentPrice,
        value: body.value,
        gainLoss: body.gainLoss,
        gainLossPercent: body.gainLossPercent,
        lotId: body.lotId,
        purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      }
    });

    return NextResponse.json({ success: true, holding });
  } catch (error) {
    console.error("Error adding holding:", error);
    return NextResponse.json({ error: "Failed to add holding" }, { status: 500 });
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
      return NextResponse.json({ error: "Lot ID required" }, { status: 400 });
    }

    await prisma.holding.deleteMany({
      where: {
        lotId,
        userId: session.user.id // Ensure user can only delete their own holdings
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing holding:", error);
    return NextResponse.json({ error: "Failed to remove holding" }, { status: 500 });
  }
}