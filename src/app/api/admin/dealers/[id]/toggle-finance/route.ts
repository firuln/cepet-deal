import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    // Only ADMIN can toggle finance feature
    if (session?.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Toggle the financeEnabled field
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { financeEnabled: !user.financeEnabled },
    })

    return NextResponse.json({
      success: true,
      financeEnabled: updatedUser.financeEnabled
    })
  } catch (error) {
    console.error('Error toggling finance feature:', error)
    return NextResponse.json({ error: 'Failed to toggle finance feature' }, { status: 500 })
  }
}
