import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import crypto from "crypto";
import { db } from "@/lib/db";

function makeCode() {
  return crypto.randomBytes(5).toString("hex").toUpperCase(); // 10 chars
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const action = body?.action;

  // BOT calls must include this header
  const botSecret = req.headers.get("x-bot-secret");
  const isBot = botSecret && botSecret === process.env.BOT_API_SECRET;

  // USER session (website) for "start"
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET });
  const userEmail = (token as any)?.email;

  // START: website user generates code
  if (action === "start") {
    if (!userEmail) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const user = await db.user.findUnique({ where: { email: userEmail } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // cleanup old/used codes (optional but nice)
    await db.discordVerifyCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } },
        ],
      },
    });

    for (let i = 0; i < 6; i++) {
      const code = makeCode();
      try {
        await db.discordVerifyCode.create({
          data: {
            code,
            userId: user.id,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 min
          },
        });
        return NextResponse.json({ ok: true, code });
      } catch {
        // code collision, retry
      }
    }

    return NextResponse.json({ error: "Could not generate code" }, { status: 500 });
  }

  // Everything below is BOT-only
  if (!isBot) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // CONFIRM: bot links discordId to user via code
  if (action === "confirm") {
    const code = String(body?.code || "").trim().toUpperCase();
    const discordId = String(body?.discordId || "").trim();
    const discordTag = String(body?.discordTag || "").trim();

    if (!code || !discordId) {
      return NextResponse.json({ error: "Missing code or discordId" }, { status: 400 });
    }

    const entry = await db.discordVerifyCode.findUnique({ where: { code } });
    if (!entry) return NextResponse.json({ error: "Invalid or expired code" }, { status: 400 });
    if (entry.usedAt) return NextResponse.json({ error: "Code already used" }, { status: 400 });
    if (entry.expiresAt.getTime() <= Date.now()) {
      return NextResponse.json({ error: "Code expired" }, { status: 400 });
    }
w = 0
    // mark used + link discord
    const updatedUser = await db.user.update({
      where: { id: entry.userId },
      data: {
        discordId,
        // If you later add discordTag to schema, store it too
        sellerProfile: {
          upsert: {
            create: { discordVerified: true },
            update: { discordVerified: true },
          },
        },
      },
      select: { username: true, email: true },
    });

    await db.discordVerifyCode.update({
      where: { code },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      username: updatedUser.username || updatedUser.email,
      discordId,
      discordTag,
    });
  }

  // STATUS: linked if user exists with this discordId
  if (action === "status") {
    const discordId = String(body?.discordId || "").trim();
    if (!discordId) return NextResponse.json({ error: "Missing discordId" }, { status: 400 });

    const user = await db.user.findUnique({ where: { discordId }, select: { username: true } });
    return NextResponse.json({ ok: true, linked: !!user, username: user?.username ?? null });
  }

  // UNLINK
  if (action === "unlink") {
    const discordId = String(body?.discordId || "").trim();
    if (!discordId) return NextResponse.json({ error: "Missing discordId" }, { status: 400 });

    await db.user.update({
      where: { discordId },
      data: {
        discordId: null,
        sellerProfile: {
          upsert: {
            create: { discordVerified: false },
            update: { discordVerified: false },
          },
        },
      },
    });

    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
