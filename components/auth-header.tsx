'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
import { ThemeSwitcher } from '@/components/theme-switcher'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function AuthHeader() {
  const { worker, signOut } = useAuth()

  if (!worker) return null

  return (
    <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
      <ThemeSwitcher />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-theme-border-primary text-theme-text-secondary hover:bg-theme-brand-secondary/20"
          >
            <User className="mr-2 h-4 w-4" />
            {worker.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-theme-bg-secondary border-theme-border-primary">
          <DropdownMenuLabel className="text-theme-text-secondary">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-theme-brand-secondary/30" />
          <DropdownMenuItem className="text-theme-text-tertiary">
            <span className="font-medium">Role:</span>
            <span className="ml-2 capitalize">{worker.role}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-theme-text-tertiary">
            <span className="font-medium">Email:</span>
            <span className="ml-2">{worker.email}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-theme-brand-secondary/30" />
          <DropdownMenuItem
            onClick={signOut}
            className="text-theme-status-error hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}