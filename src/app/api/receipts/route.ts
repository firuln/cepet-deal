import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/receipts - List receipts for current dealer
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const listingId = searchParams.get('listingId')

    const where: any = { dealerId: session.user.id }
    if (listingId) {
      where.listingId = listingId
    }

    const receipts = await prisma.receipt.findMany({
      where,
      include: {
        listing: {
          include: {
            brand: true,
            model: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Convert BigInt to Number for JSON serialization
    const serializedReceipts = receipts.map((receipt) => ({
      ...receipt,
      tandaJadi: receipt.tandaJadi ? Number(receipt.tandaJadi) : null,
      downPayment: Number(receipt.downPayment),
      totalPrice: Number(receipt.totalPrice),
      remainingPayment: receipt.remainingPayment ? Number(receipt.remainingPayment) : null,
      listing: {
        ...receipt.listing,
        price: Number(receipt.listing.price),
      },
    }))

    return NextResponse.json(serializedReceipts)
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 })
  }
}

// POST /api/receipts - Create new receipt
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has finance feature enabled
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { financeEnabled: true }
    })

    if (!user?.financeEnabled) {
      return NextResponse.json({
        error: 'Fitur keuangan belum diaktifkan. Silakan hubungi admin.'
      }, { status: 403 })
    }

    const body = await req.json()
    const { listingId, paymentMethod, tandaJadi, downPayment, buyerName, buyerAddress, markAsSold = true } = body

    // Validate required fields
    if (!listingId || !paymentMethod || !buyerName || !buyerAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // For credit payment, downPayment is required
    if (paymentMethod === 'CREDIT' && !downPayment) {
      return NextResponse.json({ error: 'Down payment is required for credit payment' }, { status: 400 })
    }

    // Get listing details
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: { brand: true, model: true },
    })

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Verify ownership
    if (listing.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Generate receipt number: RCP + YYYYMMDD + 4 digit random
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
    const randomStr = Math.floor(1000 + Math.random() * 9000)
    const receiptNumber = `RCP${dateStr}${randomStr}`

    // Calculate payments
    const totalPrice = listing.price
    const tandaJadiValue = tandaJadi ? BigInt(tandaJadi) : null
    const downPaymentValue = paymentMethod === 'CREDIT' ? BigInt(downPayment || 0) : BigInt(0)

    // For CREDIT: remaining = total - (tandaJadi + DP)
    // For CASH: remaining = null (lunas)
    let remainingPayment: bigint | null = null
    if (paymentMethod === 'CREDIT') {
      const paidUpfront = tandaJadiValue || BigInt(0) + downPaymentValue
      remainingPayment = totalPrice - paidUpfront
    }

    // Create receipt
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        listingId,
        dealerId: session.user.id,
        paymentMethod,
        tandaJadi: tandaJadiValue,
        downPayment: downPaymentValue,
        buyerName,
        buyerAddress,
        totalPrice,
        remainingPayment,
      },
      include: {
        listing: {
          include: {
            brand: true,
            model: true,
          },
        },
      },
    })

    // Update listing status to SOLD only if markAsSold is true
    if (markAsSold) {
      await prisma.listing.update({
        where: { id: listingId },
        data: { status: 'SOLD' },
      })
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

    return NextResponse.json(
      { ...serializedReceipt, listingStatus: markAsSold ? 'SOLD' : 'ACTIVE' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 })
  }
}
