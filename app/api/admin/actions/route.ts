import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { refundBuyer, releaseToSeller } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "MOD") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { action, orderId, amountCents } = await req.json();

  if (action === "freezePayouts") {
    const { sellerId } = await db.order.findUniqueOrThrow({ where: { id: orderId } });
    await db.sellerProfile.update({ where: { userId: sellerId }, data: { payoutsFrozen: true } });
    return NextResponse.json({ ok: true });
  }

  if (action === "refundBuyer") {
    await refundBuyer(orderId, amountCents);
    return NextResponse.json({ ok: true });
  }

  if (action === "releaseSeller") {
    await releaseToSeller(orderId);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
