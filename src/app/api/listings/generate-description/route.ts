import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { generateListingDescription, GenerateListingDescriptionOptions } from '@/services/listingAiService'
import { authOptions } from '@/lib/auth'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: Request) {
    try {
        console.log('=== AI Generate Listing Description API Called ===')
        const session = await getServerSession(authOptions)

        // Only ADMIN can use AI generation
        if (!session || session.user?.role !== 'ADMIN') {
            console.log('Unauthorized access attempt')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        console.log('Request body:', body)

        // Validate required fields
        const requiredFields = ['brand', 'model', 'variant', 'year', 'transmission', 'fuelType', 'bodyType', 'color', 'price', 'condition']
        const missingFields = requiredFields.filter(field => !body[field])

        if (missingFields.length > 0) {
            return NextResponse.json(
                { error: `Missing required fields: ${missingFields.join(', ')}` },
                { status: 400 }
            )
        }

        const options: GenerateListingDescriptionOptions = {
            brand: body.brand,
            model: body.model,
            variant: body.variant,
            year: body.year,
            transmission: body.transmission,
            fuelType: body.fuelType,
            bodyType: body.bodyType,
            color: body.color,
            price: body.price,
            condition: body.condition || 'NEW',
            tone: body.tone || 'professional',
            length: body.length || 'medium',
            highlightFeatures: body.highlightFeatures || [],
        }

        console.log('Calling generateListingDescription service...')
        const result = await generateListingDescription(options)

        console.log('Description generated successfully, sending response')
        return NextResponse.json({
            success: true,
            data: result,
        })
    } catch (error: any) {
        console.error('=== Error in generate description API ===')
        console.error('Error message:', error?.message)
        console.error('Error name:', error?.name)
        console.error('Error stack:', error?.stack)

        return NextResponse.json(
            {
                error: error?.message || 'Failed to generate description',
                details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
            },
            { status: 500 }
        )
    }
}
