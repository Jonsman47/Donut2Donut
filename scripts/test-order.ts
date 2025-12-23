import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.findFirst()
    const listing = await prisma.listing.findFirst()

    if (!user || !listing) {
        console.error('Missing user or listing. User:', !!user, 'Listing:', !!listing)
        return
    }

    console.log(`Trying to create order for User: ${user.username} (${user.id}) and Listing: ${listing.title} (${listing.id})`)

    try {
        const order = await prisma.order.create({
            data: {
                buyerId: user.id,
                sellerId: listing.sellerId,
                listingId: listing.id,
                quantity: 1,
                unitPriceCents: listing.priceCents,
                subtotalCents: listing.priceCents,
                platformFeeCents: Math.round(listing.priceCents * 0.075),
                totalCents: listing.priceCents + Math.round(listing.priceCents * 0.075),
                status: 'REQUESTED',
            },
        })
        console.log('Order created successfully:', order.id)
    } catch (e) {
        console.error('FAILED TO CREATE ORDER:', e)
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
