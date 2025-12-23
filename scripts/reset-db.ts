import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🔄 Auto-resetting database (listings, orders, messages)...')

    try {
        // Delete in order to respect foreign key constraints
        await (prisma as any).tradeMessage.deleteMany({})
        await prisma.deliveryProof.deleteMany({})
        await prisma.review.deleteMany({})
        await prisma.dispute.deleteMany({})
        await prisma.report.deleteMany({})
        await prisma.notification.deleteMany({})
        await prisma.trustEvent.deleteMany({})
        await prisma.order.deleteMany({})
        await prisma.listingImage.deleteMany({})
        await prisma.listing.deleteMany({})

        // Reset user balances for clean testing
        await prisma.user.updateMany({ data: { balanceCents: 0 } as any })

        console.log('✅ Success: Listings, Orders and Balances cleaned up.')
    } catch (error) {
        console.error('❌ Failed to clean database:', error)
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
