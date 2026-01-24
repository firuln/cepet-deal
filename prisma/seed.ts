import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Starting database seed...')

    // =====================
    // SEED ADMIN USER
    // =====================
    const adminPassword = await bcrypt.hash('admin123', 12)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@cepetdeal.com' },
        update: {},
        create: {
            name: 'Admin CepetDeal',
            email: 'admin@cepetdeal.com',
            password: adminPassword,
            role: UserRole.ADMIN,
            phone: '081234567890',
        },
    })
    console.log('✅ Admin user created:', admin.email)

    // =====================
    // SEED CAR BRANDS & MODELS
    // =====================
    const brandsData = [
        {
            name: 'Toyota',
            slug: 'toyota',
            logo: '/images/brands/toyota.png',
            models: ['Avanza', 'Innova', 'Fortuner', 'Rush', 'Yaris', 'Calya', 'Agya', 'Raize', 'Veloz', 'Corolla Cross']
        },
        {
            name: 'Honda',
            slug: 'honda',
            logo: '/images/brands/honda.png',
            models: ['Brio', 'Jazz', 'HR-V', 'CR-V', 'City', 'Civic', 'BR-V', 'WR-V', 'Accord', 'Mobilio']
        },
        {
            name: 'Daihatsu',
            slug: 'daihatsu',
            logo: '/images/brands/daihatsu.png',
            models: ['Xenia', 'Terios', 'Sigra', 'Ayla', 'Rocky', 'Gran Max', 'Sirion', 'Luxio']
        },
        {
            name: 'Mitsubishi',
            slug: 'mitsubishi',
            logo: '/images/brands/mitsubishi.png',
            models: ['Xpander', 'Pajero Sport', 'Triton', 'Eclipse Cross', 'Outlander', 'L300', 'Colt Diesel']
        },
        {
            name: 'Suzuki',
            slug: 'suzuki',
            logo: '/images/brands/suzuki.png',
            models: ['Ertiga', 'XL7', 'Ignis', 'Baleno', 'S-Presso', 'Jimny', 'APV', 'Carry']
        },
        {
            name: 'Nissan',
            slug: 'nissan',
            logo: '/images/brands/nissan.png',
            models: ['Grand Livina', 'X-Trail', 'Serena', 'Kicks', 'Navara', 'Terra', 'March']
        },
        {
            name: 'Mazda',
            slug: 'mazda',
            logo: '/images/brands/mazda.png',
            models: ['CX-3', 'CX-5', 'CX-8', 'Mazda 3', 'Mazda 6', 'CX-30', 'CX-9']
        },
        {
            name: 'Hyundai',
            slug: 'hyundai',
            logo: '/images/brands/hyundai.png',
            models: ['Creta', 'Stargazer', 'Palisade', 'Santa Fe', 'Ioniq 5', 'Staria', 'Kona']
        },
        {
            name: 'Wuling',
            slug: 'wuling',
            logo: '/images/brands/wuling.png',
            models: ['Confero', 'Almaz', 'Air ev', 'Cortez', 'Formo']
        },
        {
            name: 'BMW',
            slug: 'bmw',
            logo: '/images/brands/bmw.png',
            models: ['3 Series', '5 Series', 'X1', 'X3', 'X5', 'X7', 'iX', 'M4']
        },
        {
            name: 'Mercedes-Benz',
            slug: 'mercedes-benz',
            logo: '/images/brands/mercedes.png',
            models: ['C-Class', 'E-Class', 'S-Class', 'GLA', 'GLC', 'GLE', 'A-Class', 'EQS']
        },
    ]

    for (const brandData of brandsData) {
        const brand = await prisma.brand.upsert({
            where: { slug: brandData.slug },
            update: {},
            create: {
                name: brandData.name,
                slug: brandData.slug,
                logo: brandData.logo,
            },
        })

        // Create models for this brand
        for (const modelName of brandData.models) {
            const modelSlug = modelName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            await prisma.model.upsert({
                where: {
                    brandId_slug: {
                        brandId: brand.id,
                        slug: modelSlug,
                    },
                },
                update: {},
                create: {
                    name: modelName,
                    slug: modelSlug,
                    brandId: brand.id,
                },
            })
        }

        console.log(`✅ Brand seeded: ${brandData.name} with ${brandData.models.length} models`)
    }

    // =====================
    // SEED BANNERS
    // =====================
    const bannersData = [
        {
            title: 'Promo Awal Tahun',
            subtitle: 'Diskon hingga 30% untuk mobil bekas pilihan',
            image: '/images/banners/promo-1.jpg',
            link: '/mobil-bekas',
            order: 1,
        },
        {
            title: 'Mobil Baru Terbaru 2024',
            subtitle: 'Temukan mobil baru dengan harga terbaik',
            image: '/images/banners/promo-2.jpg',
            link: '/mobil-baru',
            order: 2,
        },
        {
            title: 'Jadi Dealer Resmi',
            subtitle: 'Daftarkan showroom Anda di CepetDeal',
            image: '/images/banners/promo-3.jpg',
            link: '/register',
            order: 3,
        },
    ]

    for (const banner of bannersData) {
        await prisma.banner.create({
            data: banner,
        })
    }
    console.log('✅ Banners seeded')

    // =====================
    // SEED TESTIMONIALS
    // =====================
    const testimonialsData = [
        {
            name: 'Budi Santoso',
            role: 'Pembeli Toyota Avanza',
            content: 'Proses jual beli sangat mudah dan cepat. Mobil sesuai deskripsi dan harga sangat kompetitif. Recommended!',
            rating: 5,
        },
        {
            name: 'Siti Rahayu',
            role: 'Penjual Honda CR-V',
            content: 'Sangat terbantu dengan platform CepetDeal. Mobil saya laku dalam waktu 2 minggu dengan harga yang bagus.',
            rating: 5,
        },
        {
            name: 'Ahmad Fauzi',
            role: 'Dealer Premium',
            content: 'Sebagai dealer, CepetDeal membantu kami menjangkau lebih banyak pembeli. Fitur-fiturnya sangat memudahkan.',
            rating: 5,
        },
        {
            name: 'Diana Putri',
            role: 'Pembeli Mitsubishi Xpander',
            content: 'Senang sekali bisa menemukan mobil impian dengan budget yang pas. Terima kasih CepetDeal!',
            rating: 4,
        },
    ]

    for (const testimonial of testimonialsData) {
        await prisma.testimonial.create({
            data: testimonial,
        })
    }
    console.log('✅ Testimonials seeded')

    // =====================
    // SEED SITE SETTINGS
    // =====================
    const settingsData = [
        { key: 'site_name', value: 'CepetDeal' },
        { key: 'site_tagline', value: 'Jual Beli Mobil Cepat & Mudah' },
        { key: 'contact_phone', value: '021-12345678' },
        { key: 'contact_whatsapp', value: '6281234567890' },
        { key: 'contact_email', value: 'hello@cepetdeal.com' },
        { key: 'address', value: 'Jl. Sudirman No. 123, Jakarta Pusat' },
        { key: 'facebook_url', value: 'https://facebook.com/cepetdeal' },
        { key: 'instagram_url', value: 'https://instagram.com/cepetdeal' },
        { key: 'twitter_url', value: 'https://twitter.com/cepetdeal' },
    ]

    for (const setting of settingsData) {
        await prisma.siteSetting.upsert({
            where: { key: setting.key },
            update: { value: setting.value },
            create: setting,
        })
    }
    console.log('✅ Site settings seeded')

    console.log('🎉 Database seeding completed!')
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
