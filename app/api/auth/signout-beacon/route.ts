import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function POST() {
  try {
    const session = await auth();

    if (session?.user?.id) {
      await prisma.session.deleteMany({
        where: { userId: session.user.id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in signout-beacon:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}