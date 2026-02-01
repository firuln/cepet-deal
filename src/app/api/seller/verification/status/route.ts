import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/seller/verification/status
 * Get current user's verification status
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get verification status
    const verification = await prisma.sellerVerification.findUnique({
      where: { userId: session.user.id },
      include: {
        documents: {
          orderBy: { uploadedAt: 'asc' },
        },
      },
    })

    // Get user's verified status from User model
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        isSellerVerified: true,
        sellerVerifiedAt: true,
      },
    })

    if (!verification) {
      return NextResponse.json({
        status: null,
        isSellerVerified: user?.isSellerVerified || false,
        sellerVerifiedAt: user?.sellerVerifiedAt || null,
        submittedAt: null,
        rejectionReason: null,
        documents: [],
      })
    }

    return NextResponse.json({
      status: verification.status,
      isSellerVerified: user?.isSellerVerified || false,
      sellerVerifiedAt: user?.sellerVerifiedAt || null,
      submittedAt: verification.submittedAt,
      reviewedAt: verification.reviewedAt,
      rejectionReason: verification.rejectionReason,
      notes: verification.notes,
      identityType: verification.identityType,
      idCardNumber: verification.idCardNumber,
      taxIdNumber: verification.taxIdNumber,
      businessName: verification.businessName,
      businessAddress: verification.businessAddress,
      documents: verification.documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        url: doc.url,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt,
      })),
    })

  } catch (error: any) {
    console.error('Error fetching seller verification status:', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal mengambil status verifikasi' },
      { status: 500 }
    )
  }
}
