import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
})

// Valid image MIME types
const VALID_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
]

// Max file size: 5MB
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * POST /api/upload
 * Upload image to Cloudinary
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File | null
        const folder = (formData.get('folder') as string) || 'cepetdeal'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        // Validate file type
        if (!VALID_IMAGE_TYPES.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.' },
                { status: 400 }
            )
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 5MB limit' },
                { status: 400 }
            )
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary using upload promise
        const uploadPromise = new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder,
                    resource_type: 'image',
                    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
                    max_file_size: MAX_FILE_SIZE,
                    transformation: [
                        { quality: 'auto', fetch_format: 'auto' },
                        { width: 1200, height: 900, crop: 'limit' },
                    ],
                },
                (error, result) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(result)
                    }
                }
            ).end(buffer)
        })

        const result: any = await uploadPromise

        return NextResponse.json({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
            bytes: result.bytes,
        })

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

        if (!session || !session.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const publicId = searchParams.get('publicId')

        if (!publicId) {
            return NextResponse.json({ error: 'Public ID is required' }, { status: 400 })
        }

        // Delete from Cloudinary
        const deletePromise = new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(
                publicId,
                { resource_type: 'image' },
                (error, result) => {
                    if (error) {
                        reject(error)
                    } else {
                        resolve(result)
                    }
                }
            )
        })

        const result: any = await deletePromise

        if (result.result === 'ok' || result.result === 'not found') {
            return NextResponse.json({ success: true, message: 'Image deleted successfully' })
        } else {
            return NextResponse.json(
                { error: 'Failed to delete image' },
                { status: 500 }
            )
        }

    } catch (error: any) {
        console.error('Error deleting image:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to delete image' },
            { status: 500 }
        )
    }
}
