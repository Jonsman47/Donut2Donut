import { prisma } from "@/lib/prisma";

export async function getVerificationStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      privateEmail: true,
      mcUsername: true,
      realName: true,
      tosAcceptedAt: true,
      setupCompletedAt: true,
      discordId: true,
    },
  });

  if (!user) return null;

  const profileComplete = Boolean(user.privateEmail && user.mcUsername && user.realName);
  const tosAccepted = Boolean(user.tosAcceptedAt);
  const discordConnected = Boolean(user.discordId);
  const setupComplete = profileComplete && tosAccepted && discordConnected;

  return {
    profileComplete,
    tosAccepted,
    discordConnected,
    setupComplete,
    setupCompletedAt: user.setupCompletedAt,
  };
}
