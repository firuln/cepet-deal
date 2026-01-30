/**
 * SkipLink component for accessibility
 * Allows keyboard users to skip navigation and jump to main content
 */

'use client'

import { usePathname } from 'next/navigation'

interface SkipLinkProps {
  contentId?: string
  label?: string
}

export function SkipLink({
  contentId = 'main-content',
  label = 'Lanjut ke konten utama',
}: SkipLinkProps) {
  const pathname = usePathname()

  // Don't show skip link on admin/dashboard pages
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')

  if (isDashboard) return null

  return (
    <a
      href={`#${contentId}`}
      className="
        sr-only
        focus:not-sr-only
        focus:absolute
        focus:top-4
        focus:left-4
        focus:z-50
        focus:px-4
        focus:py-2
        focus:bg-primary
        focus:text-white
        focus:rounded-lg
        focus:font-medium
        focus:shadow-lg
        focus:outline-none
        focus:ring-2
        focus:ring-offset-2
        focus:ring-primary
      "
    >
      {label}
    </a>
  )
}
