'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { ThemeSwitcher } from '@/components/theme-switcher'
import {
  Home,
  Package,
  ClipboardCheck,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Loader2,
  FileText,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Production', href: '/production', icon: Package, roles: ['worker', 'manager', 'admin'] },
  { name: 'Orders', href: '/orders', icon: FileText, roles: ['manager', 'admin'] },
  { name: 'Quality Control', href: '/quality', icon: ClipboardCheck, roles: ['worker', 'manager', 'admin'] },
  { name: 'Workers', href: '/workers', icon: Users, roles: ['manager', 'admin'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['manager', 'admin'] },
  { name: 'Settings', href: '/settings', icon: Settings, roles: ['admin'] },
]

export function MainNav() {
  const pathname = usePathname()
  const { worker, isManager, isAdmin, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const filteredNavigation = navigation.filter(item => {
    if (!item.roles) return true
    if (isAdmin) return true
    if (isManager && item.roles.includes('manager')) return true
    if (worker && item.roles.includes('worker')) return true
    return false
  })

  if (loading) {
    return (
      <nav className="bg-theme-bg-secondary border-b border-theme-border-primary">
        <div className="flex items-center justify-center h-16">
          <Loader2 className="h-6 w-6 animate-spin text-theme-text-secondary" />
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-theme-bg-secondary border-b border-theme-border-primary">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-theme-text-secondary">ZMF</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {filteredNavigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        isActive
                          ? 'bg-theme-brand-secondary/20 text-theme-text-secondary'
                          : 'text-theme-text-tertiary hover:bg-theme-brand-secondary/10 hover:text-theme-text-secondary',
                        'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors'
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive ? 'text-theme-text-secondary' : 'text-theme-text-tertiary group-hover:text-theme-text-secondary',
                          'mr-3 h-4 w-4 flex-shrink-0'
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {worker && (
              <div className="hidden md:block text-sm text-theme-text-tertiary">
                {worker.name} ({worker.role})
              </div>
            )}
            <ThemeSwitcher />
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-theme-text-tertiary hover:text-theme-text-secondary"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline ml-2">Sign Out</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {filteredNavigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      isActive
                        ? 'bg-theme-brand-secondary/20 text-theme-text-secondary'
                        : 'text-theme-text-tertiary hover:bg-theme-brand-secondary/10 hover:text-theme-text-secondary',
                      'group flex items-center rounded-md px-3 py-2 text-base font-medium'
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? 'text-theme-text-secondary' : 'text-theme-text-tertiary',
                        'mr-3 h-5 w-5 flex-shrink-0'
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </div>
            {worker && (
              <div className="px-4 py-3 border-t border-theme-border-primary">
                <div className="text-sm text-theme-text-tertiary">
                  {worker.name} ({worker.role})
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}