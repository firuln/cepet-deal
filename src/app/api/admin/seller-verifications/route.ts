import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering - always fetch fresh data
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/seller-verifications
 * Get all seller verification requests with filters and pagination
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const identityType = searchParams.get('identityType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    const where: any = {}

    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      where.status = status
    }

    if (identityType && ['INDIVIDUAL', 'BUSINESS'].includes(identityType)) {
      where.identityType = identityType
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { phone: { contains: search, mode: 'insensitive' } } },
        { idCardNumber: { contains: search, mode: 'insensitive' } },
        { businessName: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get total count
    const total = await prisma.sellerVerification.count({ where })

    // Fetch verifications
    const verifications = await prisma.sellerVerification.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            role: true,
            isSellerVerified: true,
            sellerVerifiedAt: true,
            createdAt: true,
            _count: {
              select: {
                listings: {
                  where: { status: 'ACTIVE' }
                }
              }
            }
          }
        },
        documents: {
          orderBy: { uploadedAt: 'asc' }
        }
      }
    })

    // Transform response
    const transformedVerifications = verifications.map(v => ({
      id: v.id,
      status: v.status,
      identityType: v.identityType,
      idCardNumber: v.idCardNumber,
      taxIdNumber: v.taxIdNumber,
      businessName: v.businessName,
      businessAddress: v.businessAddress,
      submittedAt: v.submittedAt,
      reviewedAt: v.reviewedAt,
      reviewedBy: v.reviewedBy,
      rejectionReason: v.rejectionReason,
      notes: v.notes,
      documents: v.documents,
      user: v.user,
      activeListingsCount: v.user._count?.listings || 0
    }))

    return NextResponse.json({
      verifications: transformedVerifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
      }
    })

  } catch (error: any) {
    console.error('Error fetching admin seller verifications:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch seller verifications' },
      { status: 500 }
    )
  }
}
