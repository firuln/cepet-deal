import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getSettings, updateSettings, maskApiKey } from '@/lib/settings'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * GET /api/admin/settings
 * Get application settings (admin only)
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const settings = await getSettings()

        // Mask API keys for security
        return NextResponse.json({
            aiProvider: settings.aiProvider,
            zhipuApiKey: settings.zhipuApiKey ? maskApiKey(settings.zhipuApiKey) : '',
            zhipuModel: settings.zhipuModel,
            geminiApiKey: settings.geminiApiKey ? maskApiKey(settings.geminiApiKey) : '',
            geminiModel: settings.geminiModel,
        })
    } catch (error: any) {
        console.error('Error fetching settings:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to fetch settings' },
            { status: 500 }
        )
    }
}

/**
 * PUT /api/admin/settings
 * Update application settings (admin only)
 */
export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()

        // Validate aiProvider
        if (body.aiProvider && !['zhipu', 'gemini'].includes(body.aiProvider)) {
            return NextResponse.json(
                { error: 'Invalid aiProvider. Must be "zhipu" or "gemini"' },
                { status: 400 }
            )
        }

        // Get current settings to preserve API keys if not provided
        const currentSettings = await getSettings()

        // If API key is masked or empty, don't update it
        const updateData: any = {
            ...(body.aiProvider !== undefined && { aiProvider: body.aiProvider }),
            ...(body.zhipuModel !== undefined && { zhipuModel: body.zhipuModel }),
            ...(body.geminiModel !== undefined && { geminiModel: body.geminiModel }),
        }

        // Only update API keys if they're provided and not masked
        if (body.zhipuApiKey && !body.zhipuApiKey.includes('...')) {
            updateData.zhipuApiKey = body.zhipuApiKey
        }
        if (body.geminiApiKey && !body.geminiApiKey.includes('...')) {
            updateData.geminiApiKey = body.geminiApiKey
        }

        const settings = await updateSettings(updateData)

        return NextResponse.json({
            success: true,
            message: 'Settings updated successfully',
            data: {
                aiProvider: settings.aiProvider,
                zhipuApiKey: settings.zhipuApiKey ? maskApiKey(settings.zhipuApiKey) : '',
                zhipuModel: settings.zhipiModel,
                geminiApiKey: settings.geminiApiKey ? maskApiKey(settings.geminiApiKey) : '',
                geminiModel: settings.geminiModel,
            },
        })
    } catch (error: any) {
        console.error('Error updating settings:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to update settings' },
            { status: 500 }
        )
    }
}
