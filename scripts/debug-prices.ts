import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const listings = await prisma.listing.findMany({ select: { id: true, title: true, priceCents: true } });
    console.log("LISTINGS:", listings);
    const orders = await prisma.order.findMany({ select: { id: true, totalCents: true, status: true } });
    console.log("ORDERS:", orders);
}
main();
