/**
 * Fonnte WhatsApp API Service
 * Documentation: https://docs.fonnte.com
 */

interface FonnteSendOptions {
    target: string
    message: string
    countryCode?: string
}

interface FonnteResponse {
    status: boolean
    message: string
    id?: string
}

/**
 * Send WhatsApp message via Fonnte API
 * @param options - Fonnte send options
 * @returns Fonnte response
 */
export async function sendFonnteMessage(options: FonnteSendOptions): Promise<FonnteResponse> {
    const apiToken = process.env.FONNTE_API_TOKEN

    if (!apiToken) {
        console.warn('FONNTE_API_TOKEN is not set. Using dummy mode.')
        return {
            status: false,
            message: 'FONNTE_API_TOKEN not configured',
        }
    }

    try {
        const response = await fetch('https://api.fonnte.com/send', {
            method: 'POST',
            headers: {
                'Authorization': apiToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                target: options.target,
                message: options.message,
                countryCode: options.countryCode || '62',
            }),
        })

        const data = await response.json()

        if (!response.ok) {
            console.error('Fonnte API error:', data)
            return {
                status: false,
                message: data.message || 'Fonnte API error',
            }
        }

        return {
            status: true,
            message: 'Message sent successfully',
            id: data.id,
        }
    } catch (error: any) {
        console.error('Fonnte fetch error:', error)
        return {
            status: false,
            message: error?.message || 'Failed to send message via Fonnte',
        }
    }
}

/**
 * Generate OTP message for WhatsApp
 * @param otpCode - OTP code
 * @param appName - Application name
 * @returns Formatted OTP message
 */
export function generateOTPMessage(otpCode: string, appName: string = 'CepetDeal'): string {
    return `*${appName}* - Kode Verifikasi

Kode OTP Anda: *${otpCode}*

Berlaku 5 menit.
Jangan bagikan kode ini kepada siapapun.

---
Jika Anda tidak meminta kode ini, abaikan pesan ini.`
}

/**
 * Send OTP via WhatsApp (Fonnte or dummy)
 * @param phone - Phone number with format +62...
 * @param otpCode - OTP code
 * @param appName - Application name
 * @returns Result object with success status and dummy OTP if in dev mode
 */
export async function sendOTP(
    phone: string,
    otpCode: string,
    appName: string = 'CepetDeal'
): Promise<{
    success: boolean
    message: string
    usedDummy: boolean
    dummyOtp?: string
}> {
    const isProduction = process.env.NODE_ENV === 'production'
    const hasFonnteToken = !!process.env.FONNTE_API_TOKEN

    // In development or without Fonnte token, use dummy mode
    if (!isProduction || !hasFonnteToken) {
        console.log('=== OTP DUMMY MODE ===')
        console.log('Phone:', phone)
        console.log('OTP Code:', otpCode)
        console.log('====================')

        return {
            success: true,
            message: 'OTP dikirim (dummy mode)',
            usedDummy: true,
            dummyOtp: otpCode,
        }
    }

    // Production mode with Fonnte token
    const message = generateOTPMessage(otpCode, appName)
    const result = await sendFonnteMessage({
        target: phone,
        message,
        countryCode: '62',
    })

    if (!result.status) {
        console.error('Failed to send OTP via Fonnte:', result.message)
        // Fallback to dummy mode if Fonnte fails
        console.log('=== FALLBACK TO DUMMY MODE ===')
        console.log('Phone:', phone)
        console.log('OTP Code:', otpCode)
        console.log('============================')

        return {
            success: true,
            message: 'OTP dikirim (fallback to dummy mode due to Fonnte error)',
            usedDummy: true,
            dummyOtp: otpCode,
        }
    }

    return {
        success: true,
        message: 'OTP dikirim ke WhatsApp',
        usedDummy: false,
    }
}

/**
 * Check if Fonnte is configured and ready
 * @returns true if Fonnte API token is set
 */
export function isFonnteConfigured(): boolean {
    return !!process.env.FONNTE_API_TOKEN
}
