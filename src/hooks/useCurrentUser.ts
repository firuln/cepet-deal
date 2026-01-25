'use client'

import useSWR from 'swr'
import { useSession } from 'next-auth/react'

interface CurrentUser {
    id: string
    name: string | null
    email: string
    username: string | null
    phone: string | null
    whatsapp: string | null
    location: string | null
    bio: string | null
    avatar: string | null
    role: string
    emailVerified: Date | null
    createdAt: Date
    updatedAt: Date
    dealer: {
        id: string
        companyName: string | null
        address: string | null
        city: string | null
        description: string | null
        logo: string | null
        verified: boolean
        verifiedAt: Date | null
    } | null
    activeListingsCount: number
    favoritesCount: number
    unreadMessagesCount: number
}

const fetcher = async (url: string): Promise<CurrentUser> => {
    const res = await fetch(url)
    if (!res.ok) {
        throw new Error('Failed to fetch user data')
    }
    return res.json()
}

/**
 * Custom hook untuk mengambil data user lengkap dari API /users/me
 * Digunakan untuk data yang tidak disimpan di session JWT (avatar, phone, dll)
 */
export function useCurrentUser() {
    const { data: session, status } = useSession()

    const { data, error, isLoading, mutate } = useSWR<CurrentUser>(
        status === 'authenticated' ? '/api/users/me' : null,
        fetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000, // 1 minute
        }
    )

    return {
        user: data,
        isLoading: status === 'loading' || isLoading,
        isError: error,
        mutate,
    }
}
