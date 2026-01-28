import { GoogleGenerativeAI } from '@google/generative-ai'

const ENV_API_KEY = process.env.GEMINI_API_KEY

if (!ENV_API_KEY) {
    console.warn('GEMINI_API_KEY is not set in environment variables')
} else {
    console.log('GEMINI_API_KEY is configured in environment')
}

export function getModel(apiKey?: string, model: string = 'gemini-1.5-flash-002') {
    const key = apiKey || ENV_API_KEY

    if (!key) {
        throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in .env.local or add it in Settings')
    }

    const genAI = new GoogleGenerativeAI(key)
    return genAI.getGenerativeModel({ model })
}

export async function generateArticleContent(prompt: string, apiKey?: string, model?: string): Promise<string> {
    try {
        console.log('Calling Gemini API with prompt length:', prompt.length, 'model:', model || 'default')
        const aiModel = getModel(apiKey, model)

        const result = await aiModel.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        console.log('Gemini response received, length:', text.length)
        return text
    } catch (error: any) {
        console.error('Error generating content with Gemini:', error)
        console.error('Error details:', {
            message: error?.message,
            status: error?.status,
            statusText: error?.statusText,
        })
        throw new Error(error?.message || 'Failed to generate content')
    }
}
