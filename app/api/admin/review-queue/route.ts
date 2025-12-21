import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function GET() {
  const user = await requireUser();
  if (user.role !== "ADMIN" && user.role !== "MOD") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Example queue: high priced or new seller listings (placeholder rule)
  const listings = await db.listing.findMany({
    where: { priceCents: { gte: 50000 } },
    take: 50,
    orderBy: { createdAt: "desc" },
    include: { seller: { include: { sellerProfile: true } }, category: true }
  });

  return NextResponse.json({ listings });
}
