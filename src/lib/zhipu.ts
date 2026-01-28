interface ChatMessage {
    role: 'system' | 'user' | 'assistant'
    content: string
}

interface ChatCompletionRequest {
    model: string
    messages: ChatMessage[]
    temperature?: number
    max_tokens?: number
    top_p?: number
}

interface ChatCompletionResponse {
    id: string
    created: number
    model: string
    choices: Array<{
        index: number
        message: {
            role: string
            content: string
        }
        finish_reason: string
    }>
    usage: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

// Zhipu AI Client
const API_BASE_URL = 'https://open.bigmodel.cn/api/paas/v4'
const ENV_API_KEY = process.env.ZHIPU_API_KEY

if (!ENV_API_KEY) {
    console.warn('ZHIPU_API_KEY is not set in environment variables')
} else {
    console.log('ZHIPU_API_KEY is configured in environment')
}

export async function generateChatCompletion(
    messages: ChatMessage[],
    model: string = 'glm-4-flash',
    apiKey?: string
): Promise<string> {
    const key = apiKey || ENV_API_KEY

    if (!key) {
        throw new Error('Zhipu API key is not configured. Please set ZHIPU_API_KEY in .env.local or add it in Settings')
    }

    try {
        console.log(`Calling Zhipu AI with model: ${model}, messages: ${messages.length}`)

        const request: ChatCompletionRequest = {
            model,
            messages,
            temperature: 0.7,
            max_tokens: 4000,
            top_p: 0.9,
        }

        const response = await fetch(`${API_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        })

        if (!response.ok) {
            const errorText = await response.text()
            console.error('Zhipu API error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText,
            })
            throw new Error(`Zhipu API error: ${response.status} ${response.statusText}`)
        }

        const data: ChatCompletionResponse = await response.json()

        if (!data.choices || data.choices.length === 0) {
            throw new Error('No response from Zhipu AI')
        }

        const content = data.choices[0].message.content
        console.log('Zhipu AI response received, length:', content.length)

        return content
    } catch (error: any) {
        console.error('Error calling Zhipu AI:', error)
        throw new Error(error?.message || 'Failed to generate content with Zhipu AI')
    }
}
