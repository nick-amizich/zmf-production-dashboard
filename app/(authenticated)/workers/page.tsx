import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkerManagementDashboard } from '@/components/management/worker-management-dashboard'

export default async function WorkersPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user has permission to access worker management
  const { data: worker } = await supabase
    .from('workers')
    .select('role, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (!worker || !worker.is_active || !['manager', 'admin'].includes(worker.role)) {
    redirect('/dashboard')
  }

  return <WorkerManagementDashboard 
    workers={[]}
    leaderboard={[]}
    availability={[]}
    activeAssignments={[]}
  />
}