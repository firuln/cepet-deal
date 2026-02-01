import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { deleteDocument } from '@/lib/upload'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * PATCH /api/admin/seller-verifications/[id]
 * Approve or reject seller verification (admin only)
 */
export async function PATCH(
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
    const { action, reason, notes } = data

    if (!id) {
      return NextResponse.json({ error: 'Verification ID is required' }, { status: 400 })
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be approve or reject' },
        { status: 400 }
      )
    }

    // Get verification
    const verification = await prisma.sellerVerification.findUnique({
      where: { id },
      include: {
        user: true,
        documents: true,
      },
    })

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    // Check if already processed
    if (verification.status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Verification already approved' },
        { status: 400 }
      )
    }

    if (verification.status === 'REJECTED' && action === 'approve') {
      // Allow approving a previously rejected verification
    }

    const reviewedAt = new Date()

    if (action === 'approve') {
      // Approve verification
      const updatedVerification = await prisma.sellerVerification.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedAt,
          reviewedBy: session.user.id,
          notes: notes || null,
          rejectionReason: null, // Clear rejection reason if any
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          documents: true,
        },
      })

      // Update user's seller verification status
      await prisma.user.update({
        where: { id: verification.userId },
        data: {
          isSellerVerified: true,
          sellerVerifiedAt: reviewedAt,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Seller verification approved successfully',
        verification: updatedVerification,
      })

    } else {
      // Reject verification
      if (!reason || !reason.trim()) {
        return NextResponse.json(
          { error: 'Rejection reason is required' },
          { status: 400 }
        )
      }

      const updatedVerification = await prisma.sellerVerification.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedAt,
          reviewedBy: session.user.id,
          rejectionReason: reason.trim(),
          notes: notes || null,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
          documents: true,
        },
      })

      // Note: We keep the user's isSellerVerified as is
      // The seller can re-apply, which will create a new verification record

      return NextResponse.json({
        success: true,
        message: 'Seller verification rejected',
        verification: updatedVerification,
      })
    }

  } catch (error: any) {
    console.error('Error updating seller verification:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update seller verification' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/seller-verifications/[id]
 * Get single seller verification details (admin only)
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const verification = await prisma.sellerVerification.findUnique({
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
            isSellerVerified: true,
            sellerVerifiedAt: true,
            createdAt: true,
            location: true,
            bio: true,
          }
        },
        documents: {
          orderBy: { uploadedAt: 'asc' }
        }
      }
    })

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    // Get user's listings count
    const activeListingsCount = await prisma.listing.count({
      where: {
        userId: verification.userId,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      ...verification,
      activeListingsCount,
    })

  } catch (error: any) {
    console.error('Error fetching seller verification:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch seller verification' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/seller-verifications/[id]
 * Delete seller verification and its documents (admin only)
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

    // Get verification with documents
    const verification = await prisma.sellerVerification.findUnique({
      where: { id },
      include: {
        documents: true,
      },
    })

    if (!verification) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 })
    }

    // Delete documents from Cloudinary
    const deletePromises = verification.documents.map(doc =>
      deleteDocument(doc.url.split('/').pop()?.split('.')[0] || '').catch(err => {
        console.error(`Failed to delete document ${doc.id}:`, err)
      })
    )

    await Promise.allSettled(deletePromises)

    // Delete verification (documents will be cascade deleted)
    await prisma.sellerVerification.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Seller verification deleted successfully',
    })

  } catch (error: any) {
    console.error('Error deleting seller verification:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete seller verification' },
      { status: 500 }
    )
  }
}
