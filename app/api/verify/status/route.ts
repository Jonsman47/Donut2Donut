import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
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

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const profileComplete = Boolean(user.email && user.mcUsername && user.realName);
  const tosAccepted = Boolean(user.tosAcceptedAt);
  const discordConnected = Boolean(user.discordId);
  const setupComplete = profileComplete && tosAccepted && discordConnected;

  return NextResponse.json({
    email: user.email,
    mcUsername: user.mcUsername,
    realName: user.realName,
    tosAcceptedAt: user.tosAcceptedAt,
    setupCompletedAt: user.setupCompletedAt,
    discordConnected,
    profileComplete,
    tosAccepted,
    setupComplete,
  });
}
