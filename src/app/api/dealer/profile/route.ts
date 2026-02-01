import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/dealer/profile
 * Get current dealer's profile
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const dealer = await prisma.dealer.findUnique({
            where: { userId: session.user.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                    }
                }
            }
        })

        if (!dealer) {
            return NextResponse.json({ error: 'Dealer profile not found' }, { status: 404 })
        }

        return NextResponse.json(dealer)

    } catch (error: any) {
        console.error('Error fetching dealer profile:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch dealer profile' },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/dealer/profile
 * Update dealer's profile (company name with limited edits)
 */
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const { companyName } = data

        if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
            return NextResponse.json(
                { error: 'Nama showroom minimal 2 karakter' },
                { status: 400 }
            )
        }

        // Get dealer
        const dealer = await prisma.dealer.findUnique({
            where: { userId: session.user.id }
        })

        if (!dealer) {
            return NextResponse.json({ error: 'Dealer profile not found' }, { status: 404 })
        }

        // Check if dealer has already edited their showroom name
        if (dealer.companyNameEditCount >= 1) {
            return NextResponse.json({
                error: 'Nama showroom hanya dapat diubah 1 kali untuk keperluan SEO',
                canEdit: false,
                editCount: dealer.companyNameEditCount,
                lastEditedAt: dealer.companyNameEditedAt
            }, { status: 403 })
        }

        // Update company name and increment edit count
        const updatedDealer = await prisma.dealer.update({
            where: { userId: session.user.id },
            data: {
                companyName: companyName.trim(),
                companyNameEditCount: { increment: 1 },
                companyNameEditedAt: new Date()
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Nama showroom berhasil diubah',
            dealer: updatedDealer
        })

    } catch (error: any) {
        console.error('Error updating dealer profile:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update dealer profile' },
            { status: 500 }
        )
    }
}
