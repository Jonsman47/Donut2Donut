import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string; role?: string } | undefined;
  const role = user?.role ?? ((session as any)?.role as string | undefined);
  if (!user?.id || (role !== "ADMIN" && process.env.NODE_ENV !== "development")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, listings, orders, messages, reviews] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.order.count(),
    prisma.tradeMessage.count(),
    prisma.review.count(),
  ]);
  const conversations = 0;

  return NextResponse.json({
    users,
    listings,
    orders,
    conversations,
    messages,
    reviews,
  });
}
