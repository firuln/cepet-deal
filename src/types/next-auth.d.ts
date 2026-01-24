import { DefaultSession } from 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: string
            avatar?: string | null
            phone?: string | null
            isDealer: boolean
            dealerVerified: boolean
        } & DefaultSession['user']
    }

    interface User {
        role: UserRole
        avatar?: string | null
        phone?: string | null
        isDealer: boolean
        dealerVerified: boolean
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
        role: string
        avatar?: string | null
        phone?: string | null
        isDealer: boolean
        dealerVerified: boolean
    }
}
