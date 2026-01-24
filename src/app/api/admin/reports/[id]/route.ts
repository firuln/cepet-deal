import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ReportStatus } from '@prisma/client'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * PUT /api/admin/reports/[id]
 * Update a report (admin only)
 */
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const data = await req.json()
        const { status, notes, action } = data

        // Check if report exists
        const report = await prisma.report.findUnique({
            where: { id }
        })

        if (!report) {
            return NextResponse.json({ error: 'Report not found' }, { status: 404 })
        }

        // Update report
        const updateData: any = {
            status: (status || report.status).toUpperCase() as ReportStatus,
            notes: notes || report.notes
        }

        if (status === 'RESOLVED' || status === 'DISMISSED') {
            updateData.reviewedBy = session.user.id
            updateData.reviewedAt = new Date()

            // If there's an action specified, handle it
            if (action === 'suspend_listing' && report.reportableType === 'LISTING') {
                await prisma.listing.update({
                    where: { id: report.reportableId },
                    data: { status: 'REJECTED' }
                })
            } else if (action === 'suspend_user' && report.reportableType === 'USER') {
                await prisma.user.update({
                    where: { id: report.reportableId },
                    data: { isSuspended: true }
                })
            }
        }

        const updatedReport = await prisma.report.update({
            where: { id },
            data: updateData,
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                reviewer: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })

        return NextResponse.json({
            success: true,
            report: updatedReport
        })
    } catch (error: any) {
        console.error('Error updating report:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update report' },
            { status: 500 }
        )
    }
}

/**
 * DELETE /api/admin/reports/[id]
 * Delete a report (admin only)
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        await prisma.report.delete({
            where: { id }
        })

        return NextResponse.json({
            success: true,
            message: 'Report deleted successfully'
        })
    } catch (error: any) {
        console.error('Error deleting report:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to delete report' },
            { status: 500 }
        )
    }
}
