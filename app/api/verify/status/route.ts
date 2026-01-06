import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getVerificationStatus } from "@/lib/verification";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  if (!user?.id) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const status = await getVerificationStatus(user.id as string);
  if (!status) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    discordConnected: status.discordConnected,
    profileComplete: status.profileComplete,
    tosAccepted: status.tosAccepted,
    setupComplete: status.setupComplete,
  });
}
