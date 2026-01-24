import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { ReportableType, ReportReason } from '@prisma/client'

/**
 * POST /api/reports
 * Create a new report (authenticated users only)
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()
        const { reportableType, reportableId, reason, description } = data

        // Validate required fields
        if (!reportableType || !reportableId || !reason) {
            return NextResponse.json(
                { error: 'reportableType, reportableId, and reason are required' },
                { status: 400 }
            )
        }

        // Validate enum values
        const validTypes = Object.values(ReportableType)
        if (!validTypes.includes(reportableType)) {
            return NextResponse.json(
                { error: 'Invalid reportableType' },
                { status: 400 }
            )
        }

        const validReasons = Object.values(ReportReason)
        if (!validReasons.includes(reason)) {
            return NextResponse.json(
                { error: 'Invalid reason' },
                { status: 400 }
            )
        }

        // Check if user already reported this item
        const existingReport = await prisma.report.findFirst({
            where: {
                reporterId: session.user.id,
                reportableType: reportableType as ReportableType,
                reportableId,
                status: { in: ['PENDING', 'REVIEWING'] }
            }
        })

        if (existingReport) {
            return NextResponse.json(
                { error: 'You have already reported this item' },
                { status: 400 }
            )
        }

        // Create report
        const report = await prisma.report.create({
            data: {
                reporterId: session.user.id,
                reportableType: reportableType as ReportableType,
                reportableId,
                reason: reason as ReportReason,
                description: description || null,
            }
        })

        return NextResponse.json({
            success: true,
            report
        })
    } catch (error: any) {
        console.error('Error creating report:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to create report' },
            { status: 500 }
        )
    }
}

/**
 * GET /api/reports
 * Get reports for the current user
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const status = searchParams.get('status')

        const where: any = {
            reporterId: session.user.id
        }

        if (status) {
            where.status = status.toUpperCase()
        }

        const reports = await prisma.report.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: false // Don't expose email
                    }
                }
            }
        })

        return NextResponse.json({ reports })
    } catch (error: any) {
        console.error('Error fetching reports:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch reports' },
            { status: 500 }
        )
    }
}
