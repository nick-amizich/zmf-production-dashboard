import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkerService } from '@/lib/services/worker-service'
import { WorkerDashboard } from '@/components/worker/worker-dashboard'

export default async function WorkerDashboardPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Get worker profile
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!worker || !worker.is_active) redirect('/login')
  
  // Get dashboard data
  const workerService = new WorkerService(supabase)
  const dashboardData = await workerService.getWorkerDashboard(worker.id)
  
  return <WorkerDashboard data={dashboardData} />
}