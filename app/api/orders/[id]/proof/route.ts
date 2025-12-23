import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
        return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id as string;
    const orderId = params.id;
    const body = await req.json().catch(() => null);

    if (!body || !body.url || !body.kind) {
        return NextResponse.json({ error: "Missing url or kind" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
        where: { id: orderId },
    });

    if (!order) {
        return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.buyerId !== userId && order.sellerId !== userId) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const proof = await prisma.deliveryProof.create({
        data: {
            orderId,
            userId,
            kind: body.kind,
            url: body.url,
        },
    });

    return NextResponse.json({ proof });
}
