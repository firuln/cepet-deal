import { generateChatCompletion } from '@/lib/zhipu'
import { generateArticleContent as generateGeminiContent } from '@/lib/gemini'
import { getSettings } from '@/lib/settings'

export interface GenerateListingDescriptionOptions {
    brand: string
    model: string
    variant: string
    year: string
    transmission: string
    fuelType: string
    bodyType: string
    color: string
    price: string
    condition: 'NEW' | 'USED'
    tone?: 'professional' | 'enthusiastic' | 'casual'
    length?: 'short' | 'medium' | 'long'
    highlightFeatures?: string[]
}

export interface GeneratedListingDescription {
    description: string
}

function getTonePrompt(tone: string): string {
    const tones: Record<string, string> = {
        professional: 'Gunakan bahasa profesional, formal, dan berwibawa. Fokus pada spesifikasi teknis dan nilai investasi.',
        enthusiastic: 'Gunakan bahasa yang antusias, energik, dan memikat. Buat pembaca tertarik dan excited dengan mobil ini.',
        casual: 'Gunakan bahasa santai, mudah dipahami, dan seperti berbicara ke teman. Buat deskripsi yang relatable.',
    }
    return tones[tone] || tones.professional
}

function getLengthPrompt(length: string): string {
    const lengths: Record<string, { words: number; paragraphs: number }> = {
        short: { words: 100, paragraphs: 2 },
        medium: { words: 200, paragraphs: 3 },
        long: { words: 350, paragraphs: 4 },
    }
    const config = lengths[length] || lengths.medium
    return `Panjang deskripsi: sekitar ${config.words} kata dalam ${config.paragraphs} paragraf.`
}

function formatPrice(priceStr: string): string {
    const price = parseInt(priceStr, 10)
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price)
}

/**
 * Generate listing description with Zhipu AI
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
 * Generate listing description with Gemini AI
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

export async function generateListingDescription(
    options: GenerateListingDescriptionOptions
): Promise<GeneratedListingDescription> {
    const {
        brand,
        model,
        variant,
        year,
        transmission,
        fuelType,
        bodyType,
        color,
        price,
        condition,
        tone = 'professional',
        length = 'medium',
        highlightFeatures = [],
    } = options

    // Get current settings
    const settings = await getSettings()
    console.log('Current AI provider:', settings.aiProvider)

    const formattedPrice = formatPrice(price)
    const conditionText = condition === 'NEW' ? 'Mobil Baru' : 'Mobil Bekas'

    const featuresText =
        highlightFeatures.length > 0
            ? `\nFitur utama untuk dihighlight: ${highlightFeatures.join(', ')}`
            : ''

    const systemPrompt = `Kamu adalah copywriter profesional untuk jual beli mobil di Indonesia.
Tugas kamu adalah membuat deskripsi mobil yang menarik, jujur, dan meyakinkan untuk calon pembeli.

PENTING:
- Tulis dengan Bahasa Indonesia yang natural dan engaging
- Hindari kata-kata berlebihan atau klaim yang menyesatkan
- Fokus pada fitur dan keunggulan yang relevan
- Buat deskripsi yang membuat pembaca tertarik untuk menghubungi penjual
- Output HANYA deskripsi, tanpa kata pembuka atau penutup dari AI`

    const userPrompt = `
Buat deskripsi iklan untuk ${conditionText} dengan detail berikut:

DATA MOBIL:
- Merk & Model: ${brand} ${model} ${variant}
- Tahun: ${year}
- Transmisi: ${transmission}
- Bahan Bakar: ${fuelType}
- Tipe Body: ${bodyType}
- Warna: ${color}
- Harga: ${formattedPrice}
${featuresText}

GAYA PENULISAN: ${getTonePrompt(tone)}
${getLengthPrompt(length)}

STRUKTUR DESKRIPSI:
1. Paragraf pembuka - Highlight mobil ini dan kenapa menarik
2. Paragraf fitur - Jelaskan fitur utama dan keunggulan
${condition === 'NEW' ? '3. Paragraf value - Nilai dan keuntungan membeli mobil baru ini' : '3. Paragraf kondisi - Kondisi mobil dan keuntungan untuk pembeli'}
4. Paragraf closing - Ajakan untuk menghubungi atau melihat langsung

OUTPUT HANYA deskripsi dalam plain text (tanpa HTML tags, tanpa markdown, tanpa penjelasan tambahan).`

    try {
        console.log('Starting listing description generation with options:', {
            car: `${brand} ${model} ${variant}`,
            tone,
            length,
        })

        let response: string

        // Generate based on active provider
        if (settings.aiProvider === 'zhipu') {
            const apiKey = settings.zhipuApiKey || ''
            if (!apiKey) {
                throw new Error('Zhipu API key is not configured. Please add it in Settings.')
            }
            response = await generateWithZhipu(
                systemPrompt,
                userPrompt,
                settings.zhipuModel,
                apiKey
            )
        } else {
            const apiKey = settings.geminiApiKey || ''
            if (!apiKey) {
                throw new Error('Gemini API key is not configured. Please add it in Settings.')
            }
            response = await generateWithGemini(
                systemPrompt,
                userPrompt,
                settings.geminiModel,
                apiKey
            )
        }

        console.log('AI Response received, cleaning up...')

        // Clean up response - remove any markdown code blocks, quotes, etc.
        let description = response
            .replace(/^```[\s\S]*?\n/g, '') // Remove opening code block
            .replace(/```$/g, '') // Remove closing code block
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .trim()

        console.log('Listing description generated successfully')
        return {
            description,
        }
    } catch (error: any) {
        console.error('Error in generateListingDescription:', error)
        console.error('Error stack:', error?.stack)
        throw new Error(error?.message || 'Failed to generate listing description')
    }
}
