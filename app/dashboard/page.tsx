import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MainDashboard } from '@/components/dashboard/main-dashboard'
import { logger } from '@/lib/logger'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get the current user - NEVER use getSession() server-side
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get worker record (all users are in workers table)
  const { data: worker } = await supabase
    .from('workers')
    .select('id, role, is_active, name, email')
    .eq('auth_user_id', user.id)
    .single()

  if (!worker?.is_active) {
    logger.error('No active worker found for user:', user.id)
    redirect('/login')
  }

  // Redirect based on role
  if (worker.role === 'worker') {
    // Regular workers go to their specific dashboard
    redirect('/worker/dashboard')
  } else {
    // Managers and admins see the main dashboard
    return <MainDashboard userRole="employee" userData={worker} />
  }
} 