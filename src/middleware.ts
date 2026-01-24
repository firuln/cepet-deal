import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const path = req.nextUrl.pathname

        // Admin routes protection
        if (path.startsWith('/admin')) {
            if (token?.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
        }

        // Dashboard routes protection
        if (path.startsWith('/dashboard')) {
            if (!token) {
                return NextResponse.redirect(new URL('/login', req.url))
            }
        }

        // Dealer-only routes (only for editing listings)
        if (path.includes('/dashboard/listings/edit')) {
            if (token?.role !== 'DEALER' && token?.role !== 'SELLER' && token?.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/dashboard', req.url))
            }
        }

        // Admin-only routes (new car listings)
        if (path === '/dashboard/listings/new') {
            if (token?.role !== 'ADMIN') {
                return NextResponse.redirect(new URL('/mobil-baru', req.url))
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const path = req.nextUrl.pathname

                // Public routes don't need authorization
                const publicPaths = ['/', '/login', '/register', '/mobil-baru', '/mobil-bekas', '/brand', '/dealer', '/calculator', '/compare']
                const isPublicPath = publicPaths.some(p => path === p || path.startsWith(p + '/'))

                if (isPublicPath) {
                    return true
                }

                // Protected routes need token
                if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
                    return !!token
                }

                return true
            },
        },
        pages: {
            signIn: '/login',
        },
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (NextAuth.js authentication routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images)
         */
        '/((?!api/auth|_next/static|_next/image|favicon.ico|images).*)',
    ],
}
