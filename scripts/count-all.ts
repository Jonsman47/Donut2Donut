import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const models = ['user', 'listing', 'category', 'order']
    for (const model of models) {
        const count = await (prisma as any)[model].count()
        console.log(`Model ${model}: ${count} records`)
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
