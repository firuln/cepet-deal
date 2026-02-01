/**
 * Slug utility functions for generating SEO-friendly URLs
 */

/**
 * Create a URL-friendly slug from text
 * Converts to lowercase, removes special characters, replaces spaces with hyphens
 */
export function createSlug(text: string): string {
    if (!text) return ''
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim()
}

/**
 * Create a composite dealer slug from company name and city
 * Example: "Auto Prima Motor" + "Jakarta Selatan" => "auto-prima-motor/jakarta-selatan"
 */
export function createDealerSlug(companyName: string, city: string): string {
    const companySlug = createSlug(companyName)
    const citySlug = createSlug(city)
    return `${companySlug}/${citySlug}`
}

/**
 * Parse a dealer slug into company slug and city slug
 * Example: "auto-prima-motor/jakarta-selatan" => { companySlug: "auto-prima-motor", citySlug: "jakarta-selatan" }
 */
export function parseDealerSlug(slug: string): { companySlug: string; citySlug: string } | null {
    const parts = slug.split('/')
    if (parts.length !== 2) return null
    const [companySlug, citySlug] = parts
    if (!companySlug || !citySlug) return null
    return { companySlug, citySlug }
}
