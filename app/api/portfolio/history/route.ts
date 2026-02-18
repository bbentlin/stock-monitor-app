import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get snapshots from the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const snapshots = await prisma.portfolioSnapshot.findMany({
      where: {
        userId: session.user.id,
        date: { gte: sixMonthsAgo },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ snapshots });
  } catch (error) {
    console.error("Error fetching portfolio history:", error);
    return NextResponse.json({ error: "Failed to fetch history" }, { status: 500 });
  }
}

// Save a new snapshot (called when holdings change or periodically)
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found. Please sign out and sign back in." },
        { status: 404 }
      );
    }

    const { totalValue, totalCost } = await request.json();

    // Only save one snapshot per day
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingSnapshot = await prisma.portfolioSnapshot.findFirst({
      where: {
        userId: session.user.id,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingSnapshot) {
      // Update today's snapshot
      const updated = await prisma.portfolioSnapshot.update({
        where: { id: existingSnapshot.id },
        data: { totalValue, totalCost },
      });
      return NextResponse.json({ snapshot: updated });
    }

    // Create new snapshot
    const snapshot = await prisma.portfolioSnapshot.create({
      data: {
        userId: session.user.id,
        totalValue,
        totalCost,
      },
    });

    return NextResponse.json({ snapshot });
  } catch (error) {
    console.error("Error saving portfolio snapshot:", error);
    return NextResponse.json({ error: "Failed to save snapshot" }, { status: 500 });
  }
}