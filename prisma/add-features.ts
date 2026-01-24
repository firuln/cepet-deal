import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Adding car features to listings...')

    // Get all active listings
    const listings = await prisma.listing.findMany({
        where: {
            status: 'ACTIVE'
        },
        select: {
            id: true,
            title: true
        }
    })

    console.log(`Found ${listings.length} active listings`)

    // Define features for each category
    const featuresByCategory = {
        Eksterior: [
            'LED Headlight',
            'Fog Lamp',
            'Alloy Wheels',
            'Roof Rail',
            'Spoiler',
            'Rear Wiper',
            'Parking Sensor',
            'Side Steps',
            'Body Kit',
            'Sunroof'
        ],
        Interior: [
            'Leather Seats',
            'Fabric Seats',
            'Climate Control',
            'Dual Zone AC',
            'Power Window',
            'Steering Switch',
            'Cruise Control',
            'Electric Seat',
            'Heated Seat',
            'Ambient Light',
            'Dashboard Wooden',
            'Sunshade'
        ],
        Keselamatan: [
            'Airbags',
            'ABS',
            'EBD',
            'VSA',
            'ESC',
            'BA',
            'Hill Start Assist',
            'Rear Camera',
            '360 Camera',
            'Blind Spot Monitor',
            'Lane Assist',
            'ISOFIX',
            'Seatbelt Reminder',
            'Immobilizer'
        ],
        Hiburan: [
            'Touchscreen',
            'Apple CarPlay',
            'Android Auto',
            'Bluetooth',
            'USB Port',
            'Wireless Charging',
            'Premium Audio',
            'Voice Command',
            'Navigation',
            'DVD Player',
            'AM/FM Radio'
        ]
    }

    // Add features to each listing
    for (const listing of listings) {
        console.log(`Processing: ${listing.title}`)

        // Generate random selection of features for each category
        const featuresToAdd: { category: string; name: string }[] = []

        // Add 5-8 Exterior features
        const exteriorCount = Math.floor(Math.random() * 4) + 5
        const exteriorFeatures = [...featuresByCategory.Eksterior]
            .sort(() => Math.random() - 0.5)
            .slice(0, exteriorCount)
        exteriorFeatures.forEach(name => featuresToAdd.push({ category: 'Eksterior', name }))

        // Add 4-7 Interior features
        const interiorCount = Math.floor(Math.random() * 4) + 4
        const interiorFeatures = [...featuresByCategory.Interior]
            .sort(() => Math.random() - 0.5)
            .slice(0, interiorCount)
        interiorFeatures.forEach(name => featuresToAdd.push({ category: 'Interior', name }))

        // Add 4-6 Safety features
        const safetyCount = Math.floor(Math.random() * 3) + 4
        const safetyFeatures = [...featuresByCategory.Keselamatan]
            .sort(() => Math.random() - 0.5)
            .slice(0, safetyCount)
        safetyFeatures.forEach(name => featuresToAdd.push({ category: 'Keselamatan', name }))

        // Add 3-5 Entertainment features
        const entertainmentCount = Math.floor(Math.random() * 3) + 3
        const entertainmentFeatures = [...featuresByCategory.Hiburan]
            .sort(() => Math.random() - 0.5)
            .slice(0, entertainmentCount)
        entertainmentFeatures.forEach(name => featuresToAdd.push({ category: 'Hiburan', name }))

        // Delete existing features for this listing
        await prisma.carFeature.deleteMany({
            where: { listingId: listing.id }
        })

        // Add new features
        for (const feature of featuresToAdd) {
            await prisma.carFeature.create({
                data: {
                    listingId: listing.id,
                    category: feature.category,
                    name: feature.name
                }
            })
        }

        console.log(`  ✓ Added ${featuresToAdd.length} features (${exteriorCount} exterior, ${interiorCount} interior, ${safetyCount} safety, ${entertainmentCount} entertainment)`)
    }

    // Display summary
    const totalFeatures = await prisma.carFeature.count()
    console.log(`\n✅ Total features added: ${totalFeatures}`)

    // Show breakdown by category
    const exteriorCount = await prisma.carFeature.count({ where: { category: 'Eksterior' } })
    const interiorCount = await prisma.carFeature.count({ where: { category: 'Interior' } })
    const safetyCount = await prisma.carFeature.count({ where: { category: 'Keselamatan' } })
    const entertainmentCount = await prisma.carFeature.count({ where: { category: 'Hiburan' } })

    console.log('\n📊 Features by category:')
    console.log(`  🚗 Eksterior: ${exteriorCount}`)
    console.log(`  🪑 Interior: ${interiorCount}`)
    console.log(`  🛡️ Keselamatan: ${safetyCount}`)
    console.log(`  🎵 Hiburan: ${entertainmentCount}`)

    console.log('\n🎉 Features seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
