'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { Shield, UserCog, User, Loader2 } from 'lucide-react'

type Role = 'worker' | 'manager' | 'admin'

export function RoleSwitcher() {
  const [currentRole, setCurrentRole] = useState<Role>('worker')
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get current user and role
    const getCurrentRole = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUserId(user.id)

      // Check worker table for current role
      const { data: worker } = await supabase
        .from('workers')
        .select('role')
        .eq('auth_user_id', user.id)
        .single()

      if (worker) {
        setCurrentRole(worker.role as Role)
      }
    }

    getCurrentRole()
  }, [supabase])

  const switchRole = async (newRole: Role) => {
    if (newRole === currentRole) return

    setIsLoading(true)
    try {
      // Update role in workers table
      const { error } = await supabase
        .from('workers')
        .update({ role: newRole })
        .eq('auth_user_id', userId)

      if (error) throw error

      setCurrentRole(newRole)
      
      toast({
        title: 'Role Updated',
        description: `You are now testing as: ${newRole}`,
      })

      // Refresh the page to apply new permissions
      router.refresh()
      
      // Redirect to appropriate dashboard
      if (newRole === 'worker') {
        router.push('/worker/dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error switching role:', error)
      toast({
        title: 'Error',
        description: 'Failed to switch role',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleIcon = (role: Role) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4" />
      case 'manager':
        return <UserCog className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: Role) => {
    switch (role) {
      case 'admin':
        return 'destructive'
      case 'manager':
        return 'secondary'
      default:
        return 'default'
    }
  }

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="shadow-lg border-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              getRoleIcon(currentRole)
            )}
            <span className="mr-2">Testing as:</span>
            <Badge variant={getRoleColor(currentRole)}>
              {currentRole}
            </Badge>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Switch Testing Role</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => switchRole('worker')}
            className="cursor-pointer"
          >
            <User className="h-4 w-4 mr-2" />
            <span>Worker</span>
            {currentRole === 'worker' && (
              <Badge variant="outline" className="ml-auto">Current</Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => switchRole('manager')}
            className="cursor-pointer"
          >
            <UserCog className="h-4 w-4 mr-2" />
            <span>Manager</span>
            {currentRole === 'manager' && (
              <Badge variant="outline" className="ml-auto">Current</Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => switchRole('admin')}
            className="cursor-pointer"
          >
            <Shield className="h-4 w-4 mr-2" />
            <span>Admin</span>
            {currentRole === 'admin' && (
              <Badge variant="outline" className="ml-auto">Current</Badge>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="px-2 py-1.5 text-xs text-muted-foreground">
            This switcher is only visible in development mode
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}