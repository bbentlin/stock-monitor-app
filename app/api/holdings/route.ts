import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const holdings = await prisma.holding.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ holdings });
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
      },
    });

    return NextResponse.json({ success: true, holding });
  } catch (error) {
    console.error("Error adding holding:", error);
    return NextResponse.json({ error: "Failed to add holding" }, { status: 500 });
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
      return NextResponse.json({ error: "Holding not found" }, { status: 404 });
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
      },
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
      return NextResponse.json({ error: "lotId is required" }, { status: 400 });
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