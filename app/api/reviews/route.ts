import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id as string;
  const body = await req.json().catch(() => null);
  const orderId = body?.orderId as string | undefined;
  const rating = body?.rating as number | undefined;
  const comment = body?.comment as string | undefined;

  if (!orderId || !rating) {
    return NextResponse.json({ error: "Missing orderId or rating" }, { status: 400 });
  }

  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { review: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  if (order.buyerId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (order.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Order must be completed before leaving a review" },
      { status: 400 }
    );
  }

  if (order.review) {
    return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
  }

  const review = await prisma.review.create({
    data: {
      orderId: order.id,
      fromId: order.buyerId,
      toId: order.sellerId,
      rating,
      comment: comment?.trim() || null,
    },
  });

  return NextResponse.json({ review }, { status: 201 });
}
