import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * POST /api/admin/settings/test
 * Test AI provider connection (admin only)
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { aiProvider, zhipuApiKey, zhipuModel, geminiApiKey, geminiModel } = body

        if (!aiProvider) {
            return NextResponse.json({ error: 'AI provider is required' }, { status: 400 })
        }

        let testResult: { success: boolean; error?: string }

        if (aiProvider === 'zhipu') {
            testResult = await testZhipuConnection(zhipuApiKey, zhipuModel || 'glm-4-flash')
        } else if (aiProvider === 'gemini') {
            testResult = await testGeminiConnection(geminiApiKey, geminiModel || 'gemini-1.5-flash-002')
        } else {
            return NextResponse.json({ error: 'Invalid AI provider' }, { status: 400 })
        }

        if (testResult.success) {
            return NextResponse.json({
                success: true,
                message: `${aiProvider === 'zhipu' ? 'Zhipu AI' : 'Gemini AI'} connection successful!`,
            })
        } else {
            return NextResponse.json(
                { error: testResult.error || 'Connection failed' },
                { status: 500 }
            )
        }
    } catch (error: any) {
        console.error('Error testing AI connection:', error)
        return NextResponse.json(
            { error: error?.message || 'Failed to test connection' },
            { status: 500 }
        )
    }
}

/**
 * Test Zhipu AI connection
 */
async function testZhipuConnection(apiKey: string | null | undefined, model: string) {
    if (!apiKey) {
        return { success: false, error: 'Zhipu API key is required' }
    }

    try {
        const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4'

        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: 'user', content: 'Hi' }
                ],
                max_tokens: 10,
            }),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Zhipu test error:', response.status, errorText)
            return { success: false, error: `Zhipu API error: ${response.status} ${response.statusText}` }
        }

        const data = await response.json()
        if (!data.choices || data.choices.length === 0) {
            return { success: false, error: 'Invalid response from Zhipu AI' }
        }

        return { success: true }
    } catch (error: any) {
        console.error('Zhipu connection test error:', error)
        return { success: false, error: error?.message || 'Failed to connect to Zhipu AI' }
    }
}

/**
 * Test Gemini AI connection
 */
async function testGeminiConnection(apiKey: string | null | undefined, model: string) {
    if (!apiKey) {
        return { success: false, error: 'Gemini API key is required' }
    }

    try {
        // Import dynamically for Gemini
        const { GoogleGenerativeAI } = await import('@google/generative-ai')

        const genAI = new GoogleGenerativeAI(apiKey)
        const aiModel = genAI.getGenerativeModel({ model })

        const result = await aiModel.generateContent('Hi')
        await result.response

        return { success: true }
    } catch (error: any) {
        console.error('Gemini connection test error:', error)
        return { success: false, error: error?.message || 'Failed to connect to Gemini AI' }
    }
}
