import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/receipts/[id] - Get receipt by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        listing: {
          include: {
            brand: true,
            model: true,
            user: {
              include: {
                dealer: true,
              },
            },
          },
        },
      },
    })

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    // Verify ownership
    if (receipt.dealerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Convert BigInt to Number for JSON serialization
    const serializedReceipt = {
      ...receipt,
      tandaJadi: receipt.tandaJadi ? Number(receipt.tandaJadi) : null,
      downPayment: Number(receipt.downPayment),
      totalPrice: Number(receipt.totalPrice),
      remainingPayment: receipt.remainingPayment ? Number(receipt.remainingPayment) : null,
      listing: {
        ...receipt.listing,
        price: Number(receipt.listing.price),
      },
    }

    return NextResponse.json(serializedReceipt)
  } catch (error) {
    console.error('Error fetching receipt:', error)
    return NextResponse.json({ error: 'Failed to fetch receipt' }, { status: 500 })
  }
}

// DELETE /api/receipts/[id] - Delete receipt by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership before deleting
    const receipt = await prisma.receipt.findUnique({
      where: { id },
    })

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 })
    }

    if (receipt.dealerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete the receipt
    await prisma.receipt.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, message: 'Receipt deleted successfully' })
  } catch (error) {
    console.error('Error deleting receipt:', error)
    return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 })
  }
}
