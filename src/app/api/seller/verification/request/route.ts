import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import {
  uploadVerificationDocument,
  validateDocumentFile,
  validateKTPNumber,
  validateNPWPNumber,
} from '@/lib/upload'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/seller/verification/request
 * Submit seller verification application
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is a SELLER
    if (session.user.role !== 'SELLER') {
      return NextResponse.json(
        { error: 'Hanya akun SELLER yang dapat mengajukan verifikasi' },
        { status: 403 }
      )
    }

    // Check if user already has a PENDING or APPROVED verification
    const existingVerification = await prisma.sellerVerification.findUnique({
      where: { userId: session.user.id },
    })

    if (existingVerification) {
      if (existingVerification.status === 'PENDING') {
        return NextResponse.json(
          { error: 'Anda sudah memiliki pengajuan verifikasi yang sedang diproses' },
          { status: 400 }
        )
      }
      if (existingVerification.status === 'APPROVED') {
        return NextResponse.json(
          { error: 'Akun Anda sudah terverifikasi' },
          { status: 400 }
        )
      }
      // If REJECTED, allow re-application by deleting old record
      if (existingVerification.status === 'REJECTED') {
        await prisma.sellerVerification.delete({
          where: { userId: session.user.id },
        })
      }
    }

    // Parse form data
    const formData = await req.formData()

    const identityType = formData.get('identityType') as 'INDIVIDUAL' | 'BUSINESS' | null
    const idCardNumber = formData.get('idCardNumber') as string | null
    const taxIdNumber = formData.get('taxIdNumber') as string | null
    const businessName = formData.get('businessName') as string | null
    const businessAddress = formData.get('businessAddress') as string | null

    // Get files
    const ktpFile = formData.get('ktpDocument') as File | null
    const selfieFile = formData.get('selfieDocument') as File | null
    const npwpFile = formData.get('npwpDocument') as File | null
    const businessDocFile = formData.get('businessDocument') as File | null

    // Validate required fields
    if (!identityType || !['INDIVIDUAL', 'BUSINESS'].includes(identityType)) {
      return NextResponse.json(
        { error: 'Jenis identitas harus dipilih' },
        { status: 400 }
      )
    }

    if (!idCardNumber || !idCardNumber.trim()) {
      return NextResponse.json(
        { error: 'Nomor KTP wajib diisi' },
        { status: 400 }
      )
    }

    // Validate KTP number
    const ktpValidation = validateKTPNumber(idCardNumber.trim())
    if (!ktpValidation.valid) {
      return NextResponse.json(
        { error: ktpValidation.error },
        { status: 400 }
      )
    }

    // Check if KTP number is already used by another verified seller
    const existingKtp = await prisma.sellerVerification.findFirst({
      where: {
        idCardNumber: idCardNumber.trim(),
        status: 'APPROVED',
        userId: { not: session.user.id },
      },
    })

    if (existingKtp) {
      return NextResponse.json(
        { error: 'Nomor KTP sudah terdaftar pada akun lain' },
        { status: 400 }
      )
    }

    // Validate business fields if BUSINESS type
    if (identityType === 'BUSINESS') {
      if (!businessName || !businessName.trim()) {
        return NextResponse.json(
          { error: 'Nama usaha wajib diisi untuk jenis identitas Badan Usaha' },
          { status: 400 }
        )
      }
      if (!businessAddress || !businessAddress.trim()) {
        return NextResponse.json(
          { error: 'Alamat usaha wajib diisi untuk jenis identitas Badan Usaha' },
          { status: 400 }
        )
      }
    }

    // Validate and upload KTP document (required)
    if (!ktpFile) {
      return NextResponse.json(
        { error: 'Dokumen KTP wajib diupload' },
        { status: 400 }
      )
    }

    const ktpValidationResult = validateDocumentFile(ktpFile, 'KTP')
    if (!ktpValidationResult.valid) {
      return NextResponse.json(
        { error: ktpValidationResult.error },
        { status: 400 }
      )
    }

    // Validate and upload selfie document (required)
    if (!selfieFile) {
      return NextResponse.json(
        { error: 'Foto selfie dengan KTP wajib diupload' },
        { status: 400 }
      )
    }

    const selfieValidationResult = validateDocumentFile(selfieFile, 'SELFIE')
    if (!selfieValidationResult.valid) {
      return NextResponse.json(
        { error: selfieValidationResult.error },
        { status: 400 }
      )
    }

    // Validate NPWP if provided
    if (npwpFile || taxIdNumber) {
      if (npwpFile) {
        const npwpFileValidation = validateDocumentFile(npwpFile, 'NPWP')
        if (!npwpFileValidation.valid) {
          return NextResponse.json(
            { error: npwpFileValidation.error },
            { status: 400 }
          )
        }
      }
      if (taxIdNumber && taxIdNumber.trim()) {
        const npwpValidation = validateNPWPNumber(taxIdNumber.trim())
        if (!npwpValidation.valid) {
          return NextResponse.json(
            { error: npwpValidation.error },
            { status: 400 }
          )
        }
      }
    }

    // Validate business document if BUSINESS type
    if (identityType === 'BUSINESS' && businessDocFile) {
      const businessDocValidation = validateDocumentFile(businessDocFile, 'BUSINESS_DOC')
      if (!businessDocValidation.valid) {
        return NextResponse.json(
          { error: businessDocValidation.error },
          { status: 400 }
        )
      }
    }

    // Upload documents to Cloudinary
    const uploadPromises: Promise<any>[] = []

    uploadPromises.push(
      uploadVerificationDocument(ktpFile, 'KTP').then(result => ({
        type: 'KTP' as const,
        ...result,
      }))
    )

    uploadPromises.push(
      uploadVerificationDocument(selfieFile, 'SELFIE').then(result => ({
        type: 'SELFIE' as const,
        ...result,
      }))
    )

    if (npwpFile) {
      uploadPromises.push(
        uploadVerificationDocument(npwpFile, 'NPWP').then(result => ({
          type: 'NPWP' as const,
          ...result,
        }))
      )
    }

    if (businessDocFile) {
      uploadPromises.push(
        uploadVerificationDocument(businessDocFile, 'BUSINESS_DOC').then(result => ({
          type: 'BUSINESS_DOC' as const,
          ...result,
        }))
      )
    }

    const uploadedDocuments = await Promise.all(uploadPromises)

    // Create verification record
    const verification = await prisma.sellerVerification.create({
      data: {
        userId: session.user.id,
        status: 'PENDING',
        identityType,
        idCardNumber: idCardNumber.trim(),
        taxIdNumber: taxIdNumber?.trim() || null,
        businessName: businessName?.trim() || null,
        businessAddress: businessAddress?.trim() || null,
        documents: {
          create: uploadedDocuments,
        },
      },
      include: {
        documents: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Pengajuan verifikasi berhasil dikirim',
      verification,
    })

  } catch (error: any) {
    console.error('Error submitting seller verification:', error)
    return NextResponse.json(
      { error: error?.message || 'Gagal mengirim pengajuan verifikasi' },
      { status: 500 }
    )
  }
}
