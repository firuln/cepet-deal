import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/dealers/[id]
 * Get single dealer by ID
 */
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const dealer = await prisma.dealer.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        role: true,
                        financeEnabled: true,
                    }
                }
            }
        })

        if (!dealer) {
            return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
        }

        return NextResponse.json(dealer)

    } catch (error: any) {
        console.error('Error fetching dealer:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch dealer' },
            { status: 500 }
        )
    }
}

/**
 * PATCH /api/admin/dealers/[id]
 * Update dealer (admin can update without restrictions)
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await req.json()
        const { companyName, resetEditCount } = data

        if (!companyName || typeof companyName !== 'string' || companyName.trim().length < 2) {
            return NextResponse.json(
                { error: 'Nama showroom minimal 2 karakter' },
                { status: 400 }
            )
        }

        // Check if dealer exists
        const existingDealer = await prisma.dealer.findUnique({
            where: { id }
        })

        if (!existingDealer) {
            return NextResponse.json({ error: 'Dealer not found' }, { status: 404 })
        }

        // Update dealer - admin can update without edit count restrictions
        const updateData: any = {
            companyName: companyName.trim(),
        }

        // Optionally reset edit count if admin wants to allow user to edit again
        if (resetEditCount) {
            updateData.companyNameEditCount = 0
            updateData.companyNameEditedAt = null
        }

        const updatedDealer = await prisma.dealer.update({
            where: { id },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        avatar: true,
                        role: true,
                        financeEnabled: true,
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
        console.error('Error updating dealer:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update dealer' },
            { status: 500 }
        )
    }
}
