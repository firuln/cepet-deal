'use client'

import { useEffect } from 'react'
import { redirect } from 'next/navigation'

export default function AdminReportsRedirectPage() {
    useEffect(() => {
        redirect('/admin/reports/list')
    }, [])

    return null
}
