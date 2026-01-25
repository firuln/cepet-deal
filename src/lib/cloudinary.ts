import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

interface UploadResult {
  url: string
  publicId: string
}

/**
 * Upload image to Cloudinary
 * @param file - File or Base64 string
 * @param folder - Folder name in Cloudinary (default: 'cepetdeal/listings')
 */
export async function uploadImage(
  file: File | string,
  folder: string = 'cepetdeal/listings'
): Promise<UploadResult> {
  try {
    let result: any

    if (typeof file === 'string') {
      // Base64 string
      result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' },
        ],
      })
    } else {
      // File object - convert to base64 first
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

      result = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' },
        ],
      })
    }

    return {
      url: result.secure_url,
      publicId: result.public_id,
    }
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw new Error('Failed to upload image')
  }
}

/**
 * Delete image from Cloudinary
 * @param publicId - Cloudinary public ID
 */
export async function deleteImage(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    throw new Error('Failed to delete image')
  }
}

export default cloudinary
