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
  fileName: string
  fileSize: number
}

/**
 * Upload document for seller verification
 * Optimized for ID cards, tax documents, and selfie photos
 */
export async function uploadVerificationDocument(
  file: File | string,
  documentType: 'KTP' | 'NPWP' | 'SELFIE' | 'BUSINESS_DOC'
): Promise<UploadResult> {
  try {
    const folder = `cepetdeal/seller-verification/${documentType}`

    let result: any
    let fileSize = 0

    if (typeof file === 'string') {
      // Base64 string
      result = await cloudinary.uploader.upload(file, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 2000, crop: 'limit' }, // Higher resolution for documents
        ],
        // Use eager transformation for better optimization
        eager: [
          { quality: 'auto', fetch_format: 'auto' }
        ],
        eager_async: true,
      })
      // Estimate file size from base64 (approximate)
      fileSize = Math.round(file.length * 0.75)
    } else {
      // File object - convert to base64 first
      fileSize = file.size
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const dataUri = `data:${file.type};base64,${buffer.toString('base64')}`

      // Transformations based on document type
      const transformations: any[] = [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 2000, crop: 'limit' },
      ]

      // For documents like KTP/NPWP, add density for better text clarity
      if (documentType === 'KTP' || documentType === 'NPWP') {
        transformations.push({ density: 300 })
      }

      result = await cloudinary.uploader.upload(dataUri, {
        folder,
        resource_type: file.type.includes('pdf') ? 'raw' : 'auto',
        transformation: transformations,
        eager: transformations,
        eager_async: true,
      })
    }

    // Generate a clean filename
    const timestamp = Date.now()
    const fileName = `${documentType}_${timestamp}`

    return {
      url: result.secure_url,
      publicId: result.public_id,
      fileName,
      fileSize,
    }
  } catch (error) {
    console.error('Error uploading verification document:', error)
    throw new Error('Failed to upload document')
  }
}

/**
 * Delete document from Cloudinary
 */
export async function deleteDocument(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    })
  } catch (error) {
    console.error('Error deleting document from Cloudinary:', error)
    throw new Error('Failed to delete document')
  }
}

/**
 * Validate file before upload
 */
export function validateDocumentFile(
  file: File,
  documentType: 'KTP' | 'NPWP' | 'SELFIE' | 'BUSINESS_DOC'
): { valid: boolean; error?: string } {
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'Ukuran file maksimal 5MB',
    }
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Format file harus JPG, PNG, atau PDF',
    }
  }

  // Specific validation for KTP and SELFIE (must be images)
  if ((documentType === 'KTP' || documentType === 'SELFIE') && file.type === 'application/pdf') {
    return {
      valid: false,
      error: 'KTP dan selfie harus berupa gambar (JPG/PNG)',
    }
  }

  return { valid: true }
}

/**
 * Validate KTP number (Indonesian ID card)
 */
export function validateKTPNumber(ktp: string): { valid: boolean; error?: string } {
  // Remove any non-digit characters
  const cleanKtp = ktp.replace(/\D/g, '')

  // KTP should be 16 digits
  if (cleanKtp.length !== 16) {
    return {
      valid: false,
      error: 'Nomor KTP harus 16 digit',
    }
  }

  // Check if all digits
  if (!/^\d+$/.test(cleanKtp)) {
    return {
      valid: false,
      error: 'Nomor KTP hanya boleh berisi angka',
    }
  }

  return { valid: true }
}

/**
 * Validate NPWP number (Indonesian tax ID)
 */
export function validateNPWPNumber(npwp: string): { valid: boolean; error?: string } {
  // Remove any non-digit and non-dot, non-dash characters
  const cleanNpwp = npwp.replace(/[^\d.-]/g, '')

  // NPWP format: XX.XXX.XXX.X-XXX.XXX (15 digits)
  const digitsOnly = cleanNpwp.replace(/\D/g, '')
  if (digitsOnly.length !== 15) {
    return {
      valid: false,
      error: 'Nomor NPWP harus 15 digit',
    }
  }

  return { valid: true }
}

export default cloudinary
