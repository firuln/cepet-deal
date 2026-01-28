import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { generateArticle, GenerateArticleOptions } from '@/services/articleAiService'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
    try {
        console.log('=== AI Generate Article API Called ===')
        const session = await getServerSession(authOptions)

        if (!session || session.user?.role !== 'ADMIN') {
            console.log('Unauthorized access attempt')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        console.log('Request body:', body)

        // Validate required fields
        if (!body.title || !body.category) {
            return NextResponse.json(
                { error: 'Title and category are required' },
                { status: 400 }
            )
        }

        const options: GenerateArticleOptions = {
            title: body.title,
            category: body.category,
            tone: body.tone || 'professional',
            keywords: body.keywords || [],
            length: body.length || 'medium',
        }

        console.log('Calling generateArticle service with Zhipu AI...')
        const article = await generateArticle(options)

        console.log('Article generated successfully with Zhipu AI, sending response')
        return NextResponse.json({
            success: true,
            data: article,
        })
    } catch (error: any) {
        console.error('=== Error in generate API ===')
        console.error('Error message:', error?.message)
        console.error('Error name:', error?.name)
        console.error('Error stack:', error?.stack)

        return NextResponse.json(
            {
                error: error?.message || 'Failed to generate article',
                details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
            },
            { status: 500 }
        )
    }
}
