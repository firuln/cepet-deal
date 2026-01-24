import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * POST /api/dealers/apply
 * Submit dealer application
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Check if user already has a dealer application
        const existingDealer = await prisma.dealer.findUnique({
            where: { userId: user.id }
        })

        if (existingDealer) {
            if (existingDealer.verified) {
                return NextResponse.json(
                    { error: 'Anda sudah terverifikasi sebagai dealer' },
                    { status: 400 }
                )
            } else {
                return NextResponse.json(
                    { error: 'Anda sudah mengajukan aplikasi dealer. Mohon tunggu verifikasi.' },
                    { status: 400 }
                )
            }
        }

        const data = await req.json()
        const { companyName, address, city, description, logo, documents } = data

        // Validate required fields
        if (!companyName || !address || !city) {
            return NextResponse.json(
                { error: 'Nama perusahaan, alamat, dan kota wajib diisi' },
                { status: 400 }
            )
        }

        // Validate documents (should be array of URLs)
        if (!documents || !Array.isArray(documents) || documents.length === 0) {
            return NextResponse.json(
                { error: 'Dokumen wajib diupload' },
                { status: 400 }
            )
        }

        // Create dealer application
        const dealer = await prisma.dealer.create({
            data: {
                userId: user.id,
                companyName,
                address,
                city,
                description: description || null,
                logo: logo || null,
                documents: documents, // Array of document URLs from Cloudinary
                verified: false // Requires admin approval
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        })

        // Update user role to DEALER (pending verification)
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'DEALER' }
        })

        return NextResponse.json({
            success: true,
            message: 'Aplikasi dealer berhasil dikirim. Mohon tunggu proses verifikasi.',
            dealer
        }, { status: 201 })

    } catch (error: any) {
        console.error('Error submitting dealer application:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to submit dealer application' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/dealers/apply
 * Get current user's dealer application status
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                dealer: true
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        if (!user.dealer) {
            return NextResponse.json({
                hasApplication: false,
                isDealer: false
            })
        }

        return NextResponse.json({
            hasApplication: true,
            isDealer: true,
            verified: user.dealer.verified,
            verifiedAt: user.dealer.verifiedAt,
            dealer: {
                id: user.dealer.id,
                companyName: user.dealer.companyName,
                city: user.dealer.city,
                logo: user.dealer.logo,
                documents: user.dealer.documents,
                createdAt: user.dealer.createdAt
            }
        })

    } catch (error: any) {
        console.error('Error fetching dealer application status:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch dealer application status' },
            { status: 500 }
        )
    }
}
