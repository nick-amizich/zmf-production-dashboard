'use client'

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'
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
    <div className="absolute top-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="border-[#8B4513]/50 text-[#d4a574] hover:bg-[#8B4513]/20"
          >
            <User className="mr-2 h-4 w-4" />
            {worker.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#1a0d08] border-[#8B4513]/30">
          <DropdownMenuLabel className="text-[#d4a574]">My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#8B4513]/30" />
          <DropdownMenuItem className="text-gray-300">
            <span className="font-medium">Role:</span>
            <span className="ml-2 capitalize">{worker.role}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="text-gray-300">
            <span className="font-medium">Email:</span>
            <span className="ml-2">{worker.email}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#8B4513]/30" />
          <DropdownMenuItem
            onClick={signOut}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/20 cursor-pointer"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}