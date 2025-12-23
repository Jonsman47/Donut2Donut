import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MC_USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const emailRaw = typeof body.email === "string" ? body.email.trim() : "";
  const mcRaw = typeof body.mcUsername === "string" ? body.mcUsername.trim() : "";
  const realNameRaw = typeof body.realName === "string" ? body.realName.trim() : "";
  const email = emailRaw.length ? emailRaw : undefined;
  const mcUsername = mcRaw.length ? mcRaw : undefined;
  const realName = realNameRaw.length ? realNameRaw : undefined;
  const tosAccepted = typeof body.tosAccepted === "boolean" ? body.tosAccepted : undefined;

  if (email && !validateEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  if (mcUsername && !MC_USERNAME_REGEX.test(mcUsername)) {
    return NextResponse.json(
      { error: "Minecraft username must be 3-16 characters (letters, numbers, underscore)" },
      { status: 400 }
    );
  }

  if (realName && realName.length < 2) {
    return NextResponse.json({ error: "Real name must be at least 2 characters" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      email: true,
      mcUsername: true,
      realName: true,
      tosAcceptedAt: true,
      setupCompletedAt: true,
      discordId: true,
    },
  });

  if (!existing) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const nextEmail = email ?? existing.email ?? null;
  const nextMc = mcUsername ?? existing.mcUsername ?? null;
  const nextRealName = realName ?? existing.realName ?? null;
  const nextTosAcceptedAt =
    tosAccepted === true ? existing.tosAcceptedAt ?? new Date() : tosAccepted === false ? null : existing.tosAcceptedAt;

  const profileComplete = Boolean(nextEmail && nextMc && nextRealName);
  const setupComplete = profileComplete && Boolean(nextTosAcceptedAt) && Boolean(existing.discordId);

  const update = await prisma.user.update({
    where: { id: session.user.id as string },
    data: {
      email: email ?? undefined,
      mcUsername: mcUsername ?? undefined,
      realName: realName ?? undefined,
      tosAcceptedAt: nextTosAcceptedAt,
      setupCompletedAt: setupComplete ? existing.setupCompletedAt ?? new Date() : null,
    },
    select: {
      email: true,
      mcUsername: true,
      realName: true,
      tosAcceptedAt: true,
      setupCompletedAt: true,
    },
  });

  return NextResponse.json({
    ...update,
    profileComplete,
    setupComplete,
  });
}
