import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkerManagementDashboard } from '@/components/management/worker-management-dashboard'
import { WorkerPerformanceRepository } from '@/lib/repositories/worker-performance-repository'

export default async function WorkerManagementPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Get manager worker profile
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!worker || worker.role !== 'manager') redirect('/dashboard')
  
  // Get all workers (both active and pending)
  const { data: workers } = await supabase
    .from('workers')
    .select('*')
    .order('name')

  // Separate active and pending workers
  const activeWorkers = workers?.filter(w => w.is_active) || []
  const pendingWorkers = workers?.filter(w => !w.is_active) || []
  
  // Get performance data
  const performanceRepo = new WorkerPerformanceRepository(supabase)
  const leaderboard = await performanceRepo.getLeaderboard(10)
  
  // Get availability data for today
  const today = new Date().toISOString().split('T')[0]
  const { data: availability } = await supabase
    .from('worker_availability')
    .select('*')
    .eq('date', today)
  
  // Get active assignments
  const { data: assignments } = await supabase
    .from('stage_assignments')
    .select(`
      *,
      worker:workers(*),
      batch:batches(*)
    `)
    .is('completed_at', null)
  
  return (
    <WorkerManagementDashboard
      workers={activeWorkers}
      pendingWorkers={pendingWorkers}
      leaderboard={leaderboard}
      availability={availability || []}
      activeAssignments={assignments || []}
    />
  )
}