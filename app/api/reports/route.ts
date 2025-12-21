import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  let user;
  try { user = await requireUser(); } catch { return NextResponse.json({ error: "Login required" }, { status: 401 }); }
  const { type, message, evidenceUrls, targetUserId, listingId, orderId } = await req.json();

  const report = await db.report.create({
    data: {
      type,
      message,
      evidenceUrls: evidenceUrls ?? [],
      reporterId: user.id,
      targetUserId,
      listingId,
      orderId,
    }
  });

  return NextResponse.json({ reportId: report.id });
}
