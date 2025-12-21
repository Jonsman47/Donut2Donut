import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import DiscordProvider from "next-auth/providers/discord";
import { z } from "zod";

import { db } from "./db";

type TokenShape = {
  uid?: string;
  role?: string;
  username?: string;
  discordId?: string;
};

function slugUsername(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

async function ensureUniqueUsername(base: string): Promise<string> {
  const clean = slugUsername(base) || "user";
  const exists = await db.user.findUnique({ where: { username: clean } });
  if (!exists) return clean;

  for (let i = 2; i <= 50; i++) {
    const candidate = `${clean}_${i}`.slice(0, 24);
    const taken = await db.user.findUnique({ where: { username: candidate } });
    if (!taken) return candidate;
  }

  const suffix = Math.random().toString(36).slice(2, 6);
  return `${clean}_${suffix}`.slice(0, 24);
}

async function upsertDiscordUser(params: {
  discordId: string;
  username: string;
  email?: string | null;
  image?: string | null;
}) {
  const { discordId, username, email, image } = params;

  const byDiscord = await db.user.findUnique({ where: { discordId } });
  if (byDiscord) {
    const nextUsername = byDiscord.username || (await ensureUniqueUsername(username));
    const user = await db.user.update({
      where: { id: byDiscord.id },
      data: {
        username: nextUsername,
        email: email ?? byDiscord.email,
        image: image ?? byDiscord.image,
        discordId,
      },
      include: { sellerProfile: true },
    });

    if (!user.sellerProfile) {
      await db.sellerProfile.create({ data: { userId: user.id } });
    }
    return user;
  }

  const uniqueUsername = await ensureUniqueUsername(username);
  const user = await db.user.create({
    data: {
      discordId,
      username: uniqueUsername,
      email: email ?? undefined,
      image: image ?? undefined,
      sellerProfile: { create: {} },
    },
  });
  return user;
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  pages: { signIn: "/login" },
  providers: [
    ...(process.env.NODE_ENV === "development"
      ? [
          CredentialsProvider({
            name: "Dev Login",
            credentials: {
              username: { label: "Username", type: "text" },
              email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
              const schema = z.object({
                username: z.string().min(2).max(24),
                email: z.string().email().optional().or(z.literal("")),
              });
              const parsed = schema.safeParse(credentials);
              if (!parsed.success) return null;

              const username = await ensureUniqueUsername(parsed.data.username);
              const email = parsed.data.email ? parsed.data.email.toLowerCase() : null;

              let user = await db.user.findUnique({ where: { username } });
              if (!user) {
                user = await db.user.create({
                  data: {
                    username,
                    email: email ?? undefined,
                    sellerProfile: { create: {} },
                  },
                });
              }

              return {
                id: user.id,
                name: user.username,
                email: user.email ?? undefined,
              };
            },
          }),
        ]
      : []),

    ...(process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET
      ? [
          DiscordProvider({
            clientId: process.env.DISCORD_CLIENT_ID,
            clientSecret: process.env.DISCORD_CLIENT_SECRET,
            authorization: { params: { scope: "identify email" } },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "discord") return true;

      const discordId = (profile as any)?.id as string | undefined;
      if (!discordId) return false;

      const usernameRaw =
        (profile as any)?.global_name || (profile as any)?.username || "user";
      const email = (profile as any)?.email as string | undefined;

      const avatarHash = (profile as any)?.avatar as string | null | undefined;
      const image = avatarHash
        ? `https://cdn.discordapp.com/avatars/${discordId}/${avatarHash}.png`
        : null;

      const dbUser = await upsertDiscordUser({
        discordId,
        username: usernameRaw,
        email: email ?? null,
        image,
      });

      (user as any).id = dbUser.id;
      (user as any).name = dbUser.username;
      (user as any).discordId = dbUser.discordId;
      (user as any).role = dbUser.role;
      return true;
    },
    async jwt({ token, user }) {
      const t = token as any as TokenShape;
      if (user) {
        t.uid = (user as any).id;
        t.username = (user as any).name;
        t.discordId = (user as any).discordId;
        t.role = (user as any).role;
      }

      if (t.uid && !t.role) {
        const dbUser = await db.user.findUnique({ where: { id: t.uid } });
        if (dbUser) {
          t.role = dbUser.role;
          t.username = dbUser.username;
          t.discordId = dbUser.discordId ?? undefined;
        }
      }
      return token;
    },
    async session({ session, token }) {
      const t = token as any as TokenShape;
      (session as any).uid = t.uid;
      (session as any).role = t.role;
      (session as any).discordId = t.discordId;
      if (session.user) {
        (session.user as any).id = t.uid;
        (session.user as any).username = t.username;
      }
      return session;
    },
  },
};

export async function requireUser() {
  const session = await getServerSession(authOptions);
  const uid = (session as any)?.uid as string | undefined;
  if (!uid) throw new Error("UNAUTHENTICATED");
  const user = await db.user.findUnique({
    where: { id: uid },
    include: { sellerProfile: true },
  });
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}
