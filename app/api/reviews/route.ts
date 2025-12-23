import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { refreshSellerStats } from "@/lib/seller-stats";

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
  const tagsInput = body?.tags as string[] | string | undefined;

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

  const tagsArray =
    typeof tagsInput === "string"
      ? tagsInput.split(",").map((tag) => tag.trim()).filter(Boolean)
      : Array.isArray(tagsInput)
        ? tagsInput.map((tag) => String(tag).trim()).filter(Boolean)
        : [];

  if (order.review) {
    const reviewAgeHours =
      (Date.now() - new Date(order.review.updatedAt ?? order.review.createdAt).getTime()) /
      (1000 * 60 * 60);

    if (reviewAgeHours > 24) {
      return NextResponse.json({ error: "Review already submitted" }, { status: 400 });
    }

    const review = await prisma.review.update({
      where: { id: order.review.id },
      data: {
        rating,
        comment: comment?.trim() || null,
        tags: tagsArray.length ? JSON.stringify(tagsArray) : null,
      },
    });

    await refreshSellerStats(order.sellerId);

    return NextResponse.json({ review }, { status: 200 });
  }

  const review = await prisma.review.create({
    data: {
      orderId: order.id,
      fromId: order.buyerId,
      toId: order.sellerId,
      rating,
      comment: comment?.trim() || null,
      tags: tagsArray.length ? JSON.stringify(tagsArray) : null,
    },
  });

  await Promise.all([
    createNotification({
      userId: order.sellerId,
      type: "review",
      title: "New review received",
      body: `You received a ${rating}★ review.`,
      linkUrl: `/market/orders/${order.id}`,
      metadata: { orderId: order.id, reviewId: review.id },
    }),
    refreshSellerStats(order.sellerId),
  ]);

  return NextResponse.json({ review }, { status: 201 });
}
