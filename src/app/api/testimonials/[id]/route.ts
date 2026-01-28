import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * PUT /api/testimonials/[id]
 * Update a testimonial (admin only)
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const data = await req.json()

    // Check if testimonial exists
    const existing = await prisma.testimonial.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    // Update testimonial
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.role !== undefined && { role: data.role }),
        ...(data.avatar !== undefined && { avatar: data.avatar }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    })

    return NextResponse.json({ testimonial })
  } catch (error: any) {
    console.error('Error updating testimonial:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to update testimonial' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/testimonials/[id]
 * Delete a testimonial (admin only)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    // Check if testimonial exists
    const existing = await prisma.testimonial.findUnique({
      where: { id }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Testimonial not found' }, { status: 404 })
    }

    // Delete testimonial
    await prisma.testimonial.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting testimonial:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete testimonial' },
      { status: 500 }
    )
  }
}
