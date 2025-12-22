import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type RouteParams = { params: { id: string } };

// PATCH /api/listings/[id]
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const listingId = params.id;

    if (!listingId) {
      return NextResponse.json(
        { error: "Missing listing id" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as any).id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    const userId = (session.user as any).id as string;

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

    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.title === "string") data.title = body.title;
    if (typeof body.description === "string") data.description = body.description;
    if (typeof body.whatYouGet === "string") data.whatYouGet = body.whatYouGet;
    if (typeof body.priceCents === "number") data.priceCents = body.priceCents;
    if (body.stock !== undefined) data.stock = body.stock;
    if (typeof body.deliveryType === "string") data.deliveryType = body.deliveryType;
    if (typeof body.escrowOnly === "boolean") data.escrowOnly = body.escrowOnly;
    if (typeof body.active === "boolean") data.active = body.active;
    if (typeof body.imageUrl === "string" && body.imageUrl.trim()) {
      data.images = {
        deleteMany: {},
        create: [{ url: body.imageUrl.trim() }],
      };
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data,
      include: { images: true, seller: true, category: true },
    });

    return NextResponse.json({ listing: updated }, { status: 200 });
  } catch (e) {
    console.error("Error updating listing:", e);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

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
