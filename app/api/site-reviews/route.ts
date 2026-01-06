import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || "1");
  const pageSize = Number(url.searchParams.get("pageSize") || "10");
  const skip = (page - 1) * pageSize;

  const [reviews, stats, total] = await Promise.all([
    prisma.siteReview.findMany({
      include: { user: { select: { id: true, username: true, image: true } } },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.siteReview.aggregate({ _avg: { rating: true } }),
    prisma.siteReview.count(),
  ]);

  return NextResponse.json({
    reviews,
    averageRating: stats._avg.rating ?? 0,
    total,
    page,
    pageSize,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const rating = body?.rating as number | undefined;
  const text = body?.text as string | undefined;

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const userId = user.id as string;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const existing = await prisma.siteReview.findFirst({
    where: { userId, createdAt: { gte: thirtyDaysAgo } },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    const review = await prisma.siteReview.update({
      where: { id: existing.id },
      data: {
        rating,
        text: text?.trim() || null,
      },
    });

    return NextResponse.json({ review }, { status: 200 });
  }

  const review = await prisma.siteReview.create({
    data: {
      userId,
      rating,
      text: text?.trim() || null,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
