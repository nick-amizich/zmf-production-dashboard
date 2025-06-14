'use client'

import { MainNav } from '@/components/navigation/main-nav'
import { RoleSwitcher } from '@/components/debug/role-switcher'

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="flex-1">
        {children}
      </main>
      <RoleSwitcher />
    </div>
  )
} 