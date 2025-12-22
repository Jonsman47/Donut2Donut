import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RouteParams = { params: { id: string } };

// DELETE /api/listings/[id]
export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const listingId = params.id;

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listing id" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur est connecté
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id as string;

    // Vérifier que l'annonce existe et appartient à ce user
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true },
    });

    if (!listing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    if (listing.sellerId !== userId) {
      return NextResponse.json(
        { error: "You are not the owner of this listing" },
        { status: 403 }
      );
    }

    await prisma.listing.delete({
      where: { id: listingId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Error deleting listing:", e);
    return NextResponse.json(
      { error: "Failed to delete listing" },
      { status: 500 }
    );
  }
}
