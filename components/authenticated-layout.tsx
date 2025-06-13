'use client'

import { AuthHeader } from '@/components/auth-header'

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      <AuthHeader />
      {children}
    </div>
  )
} 