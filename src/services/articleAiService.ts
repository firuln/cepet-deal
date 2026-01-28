import { generateChatCompletion } from '@/lib/zhipu'
import { generateArticleContent as generateGeminiContent } from '@/lib/gemini'
import { getSettings } from '@/lib/settings'

export interface GenerateArticleOptions {
    title: string
    category: 'NEWS' | 'REVIEW' | 'TIPS' | 'GUIDE' | 'PROMO'
    tone?: 'professional' | 'casual' | 'enthusiastic' | 'informative'
    keywords?: string[]
    length?: 'short' | 'medium' | 'long'
}

export interface GeneratedArticle {
    title: string
    excerpt: string
    content: string
    metaTitle: string
    metaDescription: string
}

function getCategoryPrompt(category: string): string {
    const prompts: Record<string, string> = {
        NEWS: 'Berita otomotif terkini dengan fakta dan data yang akurat. Gunakan gaya penulisan jurnalistik.',
        REVIEW: 'Review mobil yang komprehensif dengan spesifikasi, kelebihan, kekurangan, dan rekomendasi.',
        TIPS: 'Tips praktis yang berguna untuk pemilik atau pembeli mobil. Langkah-langkah yang jelas dan mudah diikuti.',
        GUIDE: 'Panduan lengkap dengan informasi mendalam. Berikan step-by-step guide yang detail.',
        PROMO: 'Konten promosi dengan call-to-action yang menarik. Highlight keunggulan dan manfaat.',
    }
    return prompts[category] || prompts.NEWS
}

function getTonePrompt(tone: string): string {
    const tones: Record<string, string> = {
        professional: 'Gunakan bahasa profesional dan formal.',
        casual: 'Gunakan bahasa santai dan mudah dipahami.',
        enthusiastic: 'Gunakan bahasa yang antusias dan energik.',
        informative: 'Fokus pada informasi yang berguna dan edukatif.',
    }
    return tones[tone] || tones.professional
}

function getLengthPrompt(length: string): string {
    const lengths: Record<string, { min: number; max: number }> = {
        short: { min: 300, max: 500 },
        medium: { min: 800, max: 1200 },
        long: { min: 1500, max: 2500 },
    }
    const config = lengths[length] || lengths.medium
    return `Panjang artikel: ${config.min}-${config.max} kata.`
}

/**
 * Generate article with Zhipu AI
 */
async function generateWithZhipu(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    apiKey: string
): Promise<string> {
    console.log(`Using Zhipu AI with model: ${model}`)
    return await generateChatCompletion(
        [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        model,
        apiKey
    )
}

/**
 * Generate article with Gemini AI
 */
async function generateWithGemini(
    systemPrompt: string,
    userPrompt: string,
    model: string,
    apiKey: string
): Promise<string> {
    console.log(`Using Gemini with model: ${model}`)

    // Combine system and user prompt for Gemini
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`
    return await generateGeminiContent(combinedPrompt, apiKey, model)
}

export async function generateArticle(options: GenerateArticleOptions): Promise<GeneratedArticle> {
    const { title, category, tone = 'professional', keywords = [], length = 'medium' } = options

    // Get current settings
    const settings = await getSettings()
    console.log('Current AI provider:', settings.aiProvider)

    const keywordsText = keywords.length > 0 ? `Kata kunci: ${keywords.join(', ')}.` : ''

    const systemPrompt = `Kamu adalah penulis artikel otomotif profesional yang ahli dalam membuat konten menarik untuk pembaca Indonesia. Tulis dengan Bahasa Indonesia yang natural, engaging, dan bebas dari kesalahan tata bahasa.`

    const userPrompt = `
Buatkan artikel otomotif dengan detail berikut:

JUDUL: ${title}
KATEGORI: ${category}
${getCategoryPrompt(category)}
GAYA BAHASA: ${getTonePrompt(tone)}
${getLengthPrompt(length)}
${keywordsText}

Format output HARUS dalam JSON structure seperti ini (hanya JSON, tanpa teks tambahan):
{
  "title": "Judul artikel yang menarik",
  "excerpt": "Ringkasan 1-2 kalimat yang menarik untuk meta description",
  "content": "Konten lengkap dalam format HTML. Gunakan tag seperti <h2>, <h3>, <p>, <ul>, <ol>, <blockquote>, dll. Mulai dengan <h2>Pendahuluan</h2>, lalu isi dengan sub-bagian yang relevan, dan tutup dengan kesimpulan.",
  "metaTitle": "SEO friendly title (50-60 karakter)",
  "metaDescription": "Meta description untuk SEO (150-160 karakter)"
}

PENTING:
1. Respons HANYA boleh berisi JSON yang valid, tanpa teks lain sebelum atau sesudahnya
2. Content harus dalam HTML yang clean dan well-structured
3. Gunakan Bahasa Indonesia yang natural dan engaging untuk pembaca Indonesia
4. Jangan gunakan markdown formatting, gunakan HTML tags
5. Pastikan konten relevan dengan industri otomotif Indonesia
6. Setiap <h2> dan <h3> harus memiliki konten yang substansial
`

    try {
        console.log('Starting article generation with options:', { title, category, tone, length })

        let response: string

        // Generate based on active provider
        if (settings.aiProvider === 'zhipu') {
            const apiKey = settings.zhipuApiKey || ''
            if (!apiKey) {
                throw new Error('Zhipu API key is not configured. Please add it in Settings.')
            }
            response = await generateWithZhipu(systemPrompt, userPrompt, settings.zhipuModel, apiKey)
        } else {
            const apiKey = settings.geminiApiKey || ''
            if (!apiKey) {
                throw new Error('Gemini API key is not configured. Please add it in Settings.')
            }
            response = await generateWithGemini(systemPrompt, userPrompt, settings.geminiModel, apiKey)
        }

        console.log('AI Response received, parsing JSON...')

        // Try to extract JSON from response
        let jsonMatch = response.match(/\{[\s\S]*\}/)

        if (!jsonMatch) {
            console.error('No JSON found in response. Response:', response.substring(0, 500))
            throw new Error('Invalid response format from AI - No JSON found')
        }

        const jsonString = jsonMatch[0]
        console.log('Extracted JSON, parsing...')
        const generated = JSON.parse(jsonString)

        console.log('Article generated successfully')
        return {
            title: generated.title || title,
            excerpt: generated.excerpt || '',
            content: generated.content || '',
            metaTitle: generated.metaTitle || title,
            metaDescription: generated.metaDescription || generated.excerpt || '',
        }
    } catch (error: any) {
        console.error('Error in generateArticle:', error)
        console.error('Error stack:', error?.stack)
        throw new Error(error?.message || 'Failed to generate article')
    }
}
