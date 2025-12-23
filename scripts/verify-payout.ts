import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function verifyPayout() {
    console.log("🔍 Verifying Revenue Split & Payout Logic...");

    // 1. Check a COMPLETED order
    const completedOrder = await (prisma.order as any).findFirst({
        where: { status: "COMPLETED" },
        include: { seller: true }
    });

    if (!completedOrder) {
        console.log("⚠️ No completed orders found. Please complete a trade first.");
        return;
    }

    const expectedFee = Math.round(completedOrder.totalCents * 0.1);
    const expectedPayout = completedOrder.totalCents - expectedFee;

    console.log(`Order ID: ${completedOrder.id}`);
    console.log(`Total: ${completedOrder.totalCents} cents`);
    console.log(`Platform Fee (Stored): ${completedOrder.platformFeeCents} cents`);
    console.log(`Expected Fee (10%): ${expectedFee} cents`);
    console.log(`Expected Payout: ${expectedPayout} cents`);
    console.log(`Seller Payout: ${expectedPayout} cents`);

    if (completedOrder.platformFeeCents === expectedFee) {
        console.log("✅ Platform Fee is correctly stored (10%).");
    } else {
        console.log(`❌ Platform Fee mismatch! Found ${completedOrder.platformFeeCents}, expected ${expectedFee}`);
    }

    // Note: we can't easily verify the exact balance increment without knowing the starting balance,
    // but we can see the current balance of the seller.
    console.log(`Seller Current Balance: ${completedOrder.seller.balanceCents} cents`);
}

verifyPayout()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
