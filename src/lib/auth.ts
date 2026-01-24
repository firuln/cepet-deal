import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email dan password wajib diisi')
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                    include: { dealer: true },
                })

                if (!user) {
                    throw new Error('Email tidak terdaftar')
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.password
                )

                if (!isPasswordValid) {
                    throw new Error('Password salah')
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
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
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.avatar = user.avatar
                token.phone = user.phone
                token.isDealer = user.isDealer
                token.dealerVerified = user.dealerVerified
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as string
                session.user.avatar = token.avatar as string | null
                session.user.phone = token.phone as string | null
                session.user.isDealer = token.isDealer as boolean
                session.user.dealerVerified = token.dealerVerified as boolean
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
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
}
