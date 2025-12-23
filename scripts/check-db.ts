import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const listings = await prisma.listing.findMany({
        include: {
            seller: true,
            category: true,
        }
    })
    console.log('Total listings in DB:', listings.length)
    listings.forEach(l => {
        console.log(`- ID: ${l.id}, Title: ${l.title}, Active: ${l.active}, Seller: ${l.seller.username} (${l.sellerId})`)
    })

    const users = await prisma.user.findMany()
    console.log('Total users in DB:', users.length)
    users.forEach(u => {
        console.log(`- ID: ${u.id}, Username: ${u.username}`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
