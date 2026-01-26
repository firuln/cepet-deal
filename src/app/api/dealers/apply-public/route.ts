import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, generateOTPExpiry, isOTPExpired } from '@/lib/otp'
import { validateWhatsApp, formatWhatsApp } from '@/lib/validation'
import { sendOTP } from '@/lib/fonnte'

/**
 * POST /api/dealers/apply-public
 * Submit dealer application without login and send OTP
 */
export async function POST(req: Request) {
    try {
        const {
            name,
            phone,
            email,
            companyName,
            address,
            city,
            description,
            logo,
            documents,
        } = await req.json()

        // Validate name
        if (!name || name.trim().length < 2) {
            return NextResponse.json(
                { error: 'Nama minimal 2 karakter' },
                { status: 400 }
            )
        }

        // Validate phone
        if (!phone || !validateWhatsApp(phone)) {
            return NextResponse.json(
                { error: 'Nomor WhatsApp tidak valid. Format: +62812xxxx atau 0812xxxx' },
                { status: 400 }
            )
        }

        // Validate company name
        if (!companyName || companyName.trim().length < 2) {
            return NextResponse.json(
                { error: 'Nama perusahaan minimal 2 karakter' },
                { status: 400 }
            )
        }

        // Validate address
        if (!address || address.trim().length < 5) {
            return NextResponse.json(
                { error: 'Alamat harus diisi lengkap (minimal 5 karakter)' },
                { status: 400 }
            )
        }

        // Validate city
        if (!city || city.trim().length < 2) {
            return NextResponse.json(
                { error: 'Kota harus dipilih' },
                { status: 400 }
            )
        }

        // Validate documents (at least SIUP and NPWP)
        if (!documents || !Array.isArray(documents) || documents.length < 2) {
            return NextResponse.json(
                { error: 'SIUP dan NPWP wajib diupload' },
                { status: 400 }
            )
        }

        // Validate email if provided
        if (email && email.trim()) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(email)) {
                return NextResponse.json(
                    { error: 'Format email tidak valid' },
                    { status: 400 }
                )
            }
        }

        const formattedPhone = formatWhatsApp(phone)

        // Check if user already exists with this phone (use findFirst because phone is not unique)
        const existingUser = await prisma.user.findFirst({
            where: { phone: formattedPhone }
        })

        if (existingUser) {
            // If user is already a dealer, redirect to dashboard
            if (existingUser.role === 'DEALER') {
                return NextResponse.json(
                    { error: 'Nomor WhatsApp ini sudah terdaftar sebagai dealer. Silakan login.' },
                    { status: 400 }
                )
            }

            // If user exists with other roles, they need to apply through dashboard
            return NextResponse.json(
                { error: 'Nomor WhatsApp ini sudah terdaftar. Silakan login dan apply dealer melalui dashboard.' },
                { status: 400 }
            )
        }

        // Check for existing pending application
        const existingApplication = await prisma.dealerApplication.findFirst({
            where: {
                phone: formattedPhone,
                verified: false,
                expiresAt: { gt: new Date() },
            }
        })

        if (existingApplication && existingApplication.otpExpiresAt && !isOTPExpired(existingApplication.otpExpiresAt)) {
            const remainingTime = Math.ceil(
                (existingApplication.otpExpiresAt.getTime() - Date.now()) / 1000 / 60
            )
            return NextResponse.json(
                { error: `Tunggu ${remainingTime} menit sebelum meminta OTP baru` },
                { status: 429 }
            )
        }

        // Generate OTP
        const otpCode = generateOTP()
        const otpExpiresAt = generateOTPExpiry()

        // Create or update dealer application
        let applicationId: string

        if (existingApplication) {
            // Update existing application
            const updated = await prisma.dealerApplication.update({
                where: { id: existingApplication.id },
                data: {
                    name: name.trim(),
                    email: email?.trim() || null,
                    companyName: companyName.trim(),
                    address: address.trim(),
                    city: city.trim(),
                    description: description?.trim() || null,
                    logo: logo || null,
                    documents,
                    otpCode,
                    otpExpiresAt,
                }
            })
            applicationId = updated.id
        } else {
            // Create new application
            const application = await prisma.dealerApplication.create({
                data: {
                    name: name.trim(),
                    phone: formattedPhone,
                    email: email?.trim() || null,
                    companyName: companyName.trim(),
                    address: address.trim(),
                    city: city.trim(),
                    description: description?.trim() || null,
                    logo: logo || null,
                    documents,
                    otpCode,
                    otpExpiresAt,
                }
            })
            applicationId = application.id
        }

        // Send OTP via Fonnte (or dummy mode in development)
        const otpResult = await sendOTP(formattedPhone, otpCode, 'CepetDeal')

        return NextResponse.json({
            success: true,
            message: otpResult.message,
            applicationId,
            // Include dummy OTP if in dummy mode (development or Fonnte not configured)
            ...(otpResult.usedDummy && { dummyOtp: otpCode }),
            expiresAt: otpExpiresAt.toISOString(),
        })

    } catch (error: any) {
        console.error('Error submitting dealer application:', error)
        return NextResponse.json(
            { error: error?.message || 'Gagal mengirim aplikasi dealer' },
            { status: 500 }
        )
    }
}
