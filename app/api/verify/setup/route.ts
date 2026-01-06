import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MC_USERNAME_REGEX = /^[a-zA-Z0-9_]{3,16}$/;

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function resolveProfileStatus(params: {
  privateEmail: string | null;
  mcUsername: string | null;
  realName: string | null;
  tosAcceptedAt: Date | null;
  discordId: string | null;
}) {
  const profileComplete = Boolean(
    params.privateEmail && params.mcUsername && params.realName
  );
  const tosAccepted = Boolean(params.tosAcceptedAt);
  const discordConnected = Boolean(params.discordId);
  const setupComplete = profileComplete && tosAccepted && discordConnected;
  return { profileComplete, tosAccepted, discordConnected, setupComplete };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userProfile = await prisma.user.findUnique({
    where: { id: sessionUser.id as string },
    select: {
      privateEmail: true,
      mcUsername: true,
      realName: true,
      tosAcceptedAt: true,
      setupCompletedAt: true,
      discordId: true,
    },
  });

  if (!userProfile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const status = resolveProfileStatus({
    privateEmail: userProfile.privateEmail ?? null,
    mcUsername: userProfile.mcUsername ?? null,
    realName: userProfile.realName ?? null,
    tosAcceptedAt: userProfile.tosAcceptedAt ?? null,
    discordId: userProfile.discordId ?? null,
  });

  return NextResponse.json({
    privateEmail: userProfile.privateEmail,
    mcUsername: userProfile.mcUsername,
    realName: userProfile.realName,
    tosAcceptedAt: userProfile.tosAcceptedAt,
    setupCompletedAt: userProfile.setupCompletedAt,
    ...status,
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const sessionUser = session?.user as { id?: string } | undefined;
  if (!sessionUser?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const emailRaw = typeof body.privateEmail === "string" ? body.privateEmail.trim() : "";
  const mcRaw = typeof body.mcUsername === "string" ? body.mcUsername.trim() : "";
  const realNameRaw = typeof body.realName === "string" ? body.realName.trim() : "";
  const privateEmail = emailRaw.length ? emailRaw : undefined;
  const mcUsername = mcRaw.length ? mcRaw : undefined;
  const realName = realNameRaw.length ? realNameRaw : undefined;
  const tosAccepted = typeof body.tosAccepted === "boolean" ? body.tosAccepted : undefined;

  if (privateEmail && !validateEmail(privateEmail)) {
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
    where: { id: sessionUser.id as string },
    select: {
      privateEmail: true,
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

  const nextEmail = privateEmail ?? existing.privateEmail ?? null;
  const nextMc = mcUsername ?? existing.mcUsername ?? null;
  const nextRealName = realName ?? existing.realName ?? null;
  const nextTosAcceptedAt =
    tosAccepted === true ? existing.tosAcceptedAt ?? new Date() : tosAccepted === false ? null : existing.tosAcceptedAt;

  const { profileComplete, setupComplete } = resolveProfileStatus({
    privateEmail: nextEmail,
    mcUsername: nextMc,
    realName: nextRealName,
    tosAcceptedAt: nextTosAcceptedAt ?? null,
    discordId: existing.discordId ?? null,
  });

  const update = await prisma.user.update({
    where: { id: sessionUser.id as string },
    data: {
      privateEmail: privateEmail ?? undefined,
      mcUsername: mcUsername ?? undefined,
      realName: realName ?? undefined,
      tosAcceptedAt: nextTosAcceptedAt,
      setupCompletedAt: setupComplete ? existing.setupCompletedAt ?? new Date() : null,
    },
    select: {
      privateEmail: true,
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
