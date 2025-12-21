import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  const { orderId, whatPromised, whatReceived, evidenceUrls } = await req.json();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.buyerId !== user.id) return NextResponse.json({ error: "Not your order" }, { status: 403 });

  const now = new Date();
  if (now > order.buyerDisputeDeadline) return NextResponse.json({ error: "Dispute window expired" }, { status: 400 });

  const dispute = await db.dispute.create({
    data: {
      orderId,
      whatPromised,
      whatReceived,
      evidenceUrls: evidenceUrls ?? [],
      openedById: user.id,
      status: "OPEN",
    },
  });

  await db.order.update({ where: { id: orderId }, data: { status: "DISPUTE_OPEN" } });

  return NextResponse.json({ disputeId: dispute.id });
}
