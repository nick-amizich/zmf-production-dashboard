import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

type Worker = Database['public']['Tables']['workers']['Row']
type WorkerRole = Database['public']['Enums']['worker_role']

interface AuthContext {
  user: {
    id: string
    email?: string
  }
  worker: Worker
}

type RouteHandler<T = any> = (
  request: NextRequest,
  context: AuthContext & T
) => Promise<Response> | Response

type RouteContext = {
  params: Promise<Record<string, string>>
}

interface ProtectOptions {
  requiredRole?: WorkerRole | WorkerRole[]
  allowInactive?: boolean
}

/**
 * Protects an API route with authentication and optional role-based access control
 */
export function protectRoute<T = any>(
  handler: RouteHandler<T>,
  options: ProtectOptions = {}
) {
  return async (request: NextRequest, context: RouteContext) => {
    const supabase = await createClient()
    
    // Extract params
    const params = await context.params
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Get the worker profile
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
    
    if (workerError || !worker) {
      return NextResponse.json(
        { error: 'Worker profile not found' },
        { status: 403 }
      )
    }
    
    // Check if worker is active (unless explicitly allowed)
    if (!options.allowInactive && !worker.is_active) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      )
    }
    
    // Check role requirements
    if (options.requiredRole) {
      const requiredRoles = Array.isArray(options.requiredRole) 
        ? options.requiredRole 
        : [options.requiredRole]
      
      if (!requiredRoles.includes(worker.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        )
      }
    }
    
    // Call the handler with auth context
    const authContext: AuthContext = {
      user: {
        id: user.id,
        email: user.email,
      },
      worker,
    }
    
    const mergedContext = { ...authContext, params } as unknown as AuthContext & T
    return handler(request, mergedContext)
  }
}

/**
 * Check if a worker has a specific role or higher
 */
export function hasRole(workerRole: WorkerRole, requiredRole: WorkerRole): boolean {
  const roleHierarchy: Record<WorkerRole, number> = {
    worker: 1,
    manager: 2,
    admin: 3,
  }
  
  return roleHierarchy[workerRole] >= roleHierarchy[requiredRole]
}

/**
 * Check if a worker has permission for a specific action
 */
export function hasPermission(
  workerRole: WorkerRole,
  permission: string
): boolean {
  const permissions: Record<WorkerRole, string[]> = {
    worker: [
      'view:own-tasks',
      'update:own-tasks',
      'create:quality-checks',
      'create:issues',
      'view:orders',
      'view:batches',
    ],
    manager: [
      'view:own-tasks',
      'update:own-tasks',
      'create:quality-checks',
      'create:issues',
      'view:orders',
      'view:batches',
      'view:all-tasks',
      'update:all-tasks',
      'create:batches',
      'assign:workers',
      'view:reports',
      'manage:orders',
    ],
    admin: ['*'], // All permissions
  }
  
  if (workerRole === 'admin') return true
  
  return permissions[workerRole]?.includes(permission) ?? false
}