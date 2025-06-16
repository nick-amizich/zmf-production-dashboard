import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import FrontScreen from '@/components/screens/front-screen'

import { logger } from '@/lib/logger'
export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get the current user - NEVER use getSession() server-side
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Always validate employee - matching field names with property access
  const { data: employee, error } = await supabase
    .from('workers')
    .select('id, role, is_active, name, email')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !employee) {
    logger.error('Employee lookup error:', error)
    redirect('/login')
  }

  if (!employee.is_active) {
    redirect('/login')
  }

  return <FrontScreen />
} 