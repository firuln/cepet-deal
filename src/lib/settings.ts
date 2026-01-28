import { prisma } from './prisma'

export interface AppSettingsData {
    aiProvider: 'zhipu' | 'gemini'
    zhipuApiKey: string | null
    zhipuModel: string
    geminiApiKey: string | null
    geminiModel: string
}

/**
 * Get application settings
 * Creates default settings if not exists
 */
export async function getSettings(): Promise<AppSettingsData> {
    let settings = await prisma.appSettings.findFirst()

    // Create default settings if not exists
    if (!settings) {
        settings = await prisma.appSettings.create({
            data: {
                aiProvider: 'zhipu',
                zhipuApiKey: process.env.ZHIPU_API_KEY || null,
                zhipuModel: 'glm-4-flash',
                geminiApiKey: process.env.GEMINI_API_KEY || null,
                geminiModel: 'gemini-1.5-flash-002',
            },
        })
    }

    return {
        aiProvider: settings.aiProvider as 'zhipu' | 'gemini',
        zhipuApiKey: settings.zhipuApiKey,
        zhipuModel: settings.zhipuModel,
        geminiApiKey: settings.geminiApiKey,
        geminiModel: settings.geminiModel,
    }
}

/**
 * Update application settings
 */
export async function updateSettings(data: Partial<AppSettingsData>): Promise<AppSettingsData> {
    const settings = await prisma.appSettings.findFirst()

    if (!settings) {
        // Create if not exists
        const newSettings = await prisma.appSettings.create({
            data: {
                aiProvider: data.aiProvider || 'zhipu',
                zhipuApiKey: data.zhipuApiKey || null,
                zhipuModel: data.zhipuModel || 'glm-4-flash',
                geminiApiKey: data.geminiApiKey || null,
                geminiModel: data.geminiModel || 'gemini-1.5-flash-002',
            },
        })

        return {
            aiProvider: newSettings.aiProvider as 'zhipu' | 'gemini',
            zhipuApiKey: newSettings.zhipuApiKey,
            zhipuModel: newSettings.zhipuModel,
            geminiApiKey: newSettings.geminiApiKey,
            geminiModel: newSettings.geminiModel,
        }
    }

    // Update existing
    const updatedSettings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: {
            ...(data.aiProvider !== undefined && { aiProvider: data.aiProvider }),
            ...(data.zhipuApiKey !== undefined && { zhipuApiKey: data.zhipuApiKey }),
            ...(data.zhipuModel !== undefined && { zhipuModel: data.zhipuModel }),
            ...(data.geminiApiKey !== undefined && { geminiApiKey: data.geminiApiKey }),
            ...(data.geminiModel !== undefined && { geminiModel: data.geminiModel }),
        },
    })

    return {
        aiProvider: updatedSettings.aiProvider as 'zhipu' | 'gemini',
        zhipuApiKey: updatedSettings.zhipuApiKey,
        zhipuModel: updatedSettings.zhipuModel,
        geminiApiKey: updatedSettings.geminiApiKey,
        geminiModel: updatedSettings.geminiModel,
    }
}

/**
 * Get active API key based on current settings
 */
export async function getActiveAiApiKey(): Promise<string> {
    const settings = await getSettings()

    if (settings.aiProvider === 'zhipu') {
        return settings.zhipuApiKey || process.env.ZHIPU_API_KEY || ''
    } else {
        return settings.geminiApiKey || process.env.GEMINI_API_KEY || ''
    }
}

/**
 * Mask API key for display
 */
export function maskApiKey(key: string | null): string {
    if (!key) return ''
    if (key.length <= 8) return '****'
    return key.substring(0, 8) + '...' + key.substring(key.length - 4)
}
