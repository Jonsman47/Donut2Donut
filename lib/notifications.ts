import { prisma } from "@/lib/prisma";

type CreateNotificationInput = {
  userId: string;
  type: string;
  title: string;
  body: string;
  linkUrl?: string | null;
  metadata?: Record<string, any> | null;
};

export async function createNotification({
  userId,
  type,
  title,
  body,
  linkUrl,
  metadata,
}: CreateNotificationInput) {
  const twoSecondsAgo = new Date(Date.now() - 2000);
  const existing = await prisma.notification.findFirst({
    where: {
      userId,
      type,
      title,
      createdAt: { gte: twoSecondsAgo },
    },
    select: { id: true },
  });

  if (existing) return existing;

  return prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      linkUrl: linkUrl ?? null,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}
