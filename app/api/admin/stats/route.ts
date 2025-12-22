import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  const role = (session as any)?.role as string | undefined;
  if (!session?.user?.id || (role !== "ADMIN" && process.env.NODE_ENV !== "development")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [users, listings, orders, conversations, messages, reviews] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.order.count(),
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.review.count(),
  ]);

  return NextResponse.json({
    users,
    listings,
    orders,
    conversations,
    messages,
    reviews,
  });
}
