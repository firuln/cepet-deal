import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/receipts/bulk-delete - Delete multiple receipts
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { ids } = body as { ids: string[] }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid request: ids array is required' }, { status: 400 })
    }

    // Delete all receipts that belong to the current dealer
    const result = await prisma.receipt.deleteMany({
      where: {
        id: {
          in: ids,
        },
        dealerId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${result.count} receipt(s)`,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error('Error bulk deleting receipts:', error)
    return NextResponse.json({ error: 'Failed to delete receipts' }, { status: 500 })
  }
}
