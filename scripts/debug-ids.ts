import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const listing = await prisma.listing.findFirst({
        include: { seller: true }
    })
    if (listing) {
        console.log('Listing:', listing.title)
        console.log('Listing Seller ID:', listing.sellerId)
        console.log('Seller Username:', listing.seller.username)
    } else {
        console.log('No listing found')
    }

    const users = await prisma.user.findMany()
    users.forEach(u => console.log(`User in DB: ${u.username} (${u.id})`))
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
