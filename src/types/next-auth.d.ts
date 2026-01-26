import { DefaultSession } from 'next-auth'
import { UserRole } from '@prisma/client'

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            role: string
            // Data lain diambil dari database melalui API /users/me
            // avatar, phone, isDealer, dealerVerified tidak di-session
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
        // Hanya simpan data minimal di JWT
    }
}
