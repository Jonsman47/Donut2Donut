import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";
  const cat = url.searchParams.get("cat") || "";
  const escrow = url.searchParams.get("escrow") !== "0";

  const where: any = { active: true };
  if (q) where.OR = [{ title: { contains: q, mode: "insensitive" } }, { description: { contains: q, mode: "insensitive" } }];
  if (cat) where.category = { slug: cat };
  if (escrow) where.escrowOnly = true;

  const listings = await db.listing.findMany({
    where,
    take: 60,
    orderBy: { createdAt: "desc" },
    include: { category: true, seller: { include: { sellerProfile: true } } }
  });

  return NextResponse.json({ listings });
}
