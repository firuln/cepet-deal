import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadImage } from '@/lib/cloudinary'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/upload
 * Upload image to Cloudinary
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse form data
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum 5MB allowed.' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const result = await uploadImage(file, 'cepetdeal/listings')

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to upload image' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/upload
 * Delete image from Cloudinary
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { publicId } = await req.json()

    if (!publicId) {
      return NextResponse.json({ error: 'Public ID is required' }, { status: 400 })
    }

    const { deleteImage } = await import('@/lib/cloudinary')
    await deleteImage(publicId)

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    }, { status: 200 })

  } catch (error: any) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to delete image' },
      { status: 500 }
    )
  }
}
