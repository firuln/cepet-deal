'use client'

import { SessionProvider } from 'next-auth/react'
import { SWRConfig } from 'swr'
import { ReactNode } from 'react'
import { ToastProvider } from '@/components/ui'

interface ProvidersProps {
    children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <SWRConfig
                value={{
                    revalidateOnFocus: false,
                    dedupingInterval: 60000, // 1 minute
                    fetcher: async (url: string) => {
                        const res = await fetch(url)
                        if (!res.ok) {
                            throw new Error('Failed to fetch data')
                        }
                        return res.json()
                    },
                }}
            >
                <ToastProvider>
                    {children}
                </ToastProvider>
            </SWRConfig>
        </SessionProvider>
    )
}
