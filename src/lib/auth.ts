import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import { formatWhatsApp } from '@/lib/validation'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                identifier: { label: 'Username, Email, atau WhatsApp', type: 'text' },
                password: { label: 'Password', type: 'password' },
                rememberMe: { label: 'Ingat Saya', type: 'boolean' },
            },
            async authorize(credentials) {
                if (!credentials?.identifier || !credentials?.password) {
                    throw new Error('Username/Email/WhatsApp dan password wajib diisi')
                }

                const identifier = credentials.identifier as string
                const password = credentials.password as string

                // Try to find user by username, email, or phone
                // First, format the identifier to check if it's a phone number
                const formattedPhone = identifier.replace(/[^\d]/g, '')
                const isMaybePhone = formattedPhone.startsWith('62') || formattedPhone.startsWith('08')

                let user = null

                if (isMaybePhone) {
                    // Search by phone (formatted)
                    const phoneNumber = formatWhatsApp(identifier)
                    user = await prisma.user.findFirst({
                        where: { phone: phoneNumber },
                        include: { dealer: true },
                    })
                } else {
                    // Search by username OR email
                    user = await prisma.user.findFirst({
                        where: {
                            OR: [
                                { username: { equals: identifier, mode: 'insensitive' } },
                                { email: { equals: identifier, mode: 'insensitive' } },
                            ]
                        },
                        include: { dealer: true },
                    })
                }

                if (!user) {
                    throw new Error('Username, email, atau WhatsApp tidak terdaftar')
                }

                // Check if user has password
                if (!user.password || user.password === '') {
                    throw new Error('Akun ini tidak menggunakan password. Silakan reset password.')
                }

                const isPasswordValid = await bcrypt.compare(password, user.password)

                if (!isPasswordValid) {
                    throw new Error('Password salah')
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    username: user.username,
                    role: user.role,
                    avatar: user.avatar,
                    phone: user.phone,
                    isDealer: !!user.dealer,
                    dealerVerified: user.dealer?.verified || false,
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            // Update token when user signs in
            if (user) {
                token.id = user.id
                token.role = user.role
                token.username = user.username
                // Store rememberMe preference for maxAge calculation
                if ('rememberMe' in user) {
                    token.rememberMe = user.rememberMe as boolean
                }
            }

            // Handle session update for remember me toggle
            if (trigger === 'update' && session) {
                // Preserve existing token data
                return { ...token, ...session }
            }

            return token
        },
        async session({ session, token, newSession, trigger }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.username = token.username as string | undefined
            }

            // Handle session update for remember me toggle
            if (trigger === 'update' && newSession) {
                return newSession as any
            }

            return session
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // Default 30 days (can be overridden per session)
    },
    secret: process.env.NEXTAUTH_SECRET,
}

// Helper function to get session max age based on remember me preference
export function getSessionMaxAge(rememberMe: boolean): number {
    // If remember me is checked: 30 days
    // If not checked: 1 day
    return rememberMe ? 30 * 24 * 60 * 60 : 1 * 24 * 60 * 60
}
