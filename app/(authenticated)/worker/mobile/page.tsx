import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkerService } from '@/lib/services/worker-service'
import { MobileWorkerInterface } from '@/components/worker/mobile-worker-interface'

export default async function MobileWorkerPage() {
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
  
  // Get simplified data for mobile
  const workerService = new WorkerService(supabase)
  const [assignments, notifications] = await Promise.all([
    workerService.getActiveAssignments(worker.id),
    workerService.getWorkerNotifications(worker.id, 5),
  ])
  
  return (
    <MobileWorkerInterface 
      worker={worker}
      assignments={assignments}
      notifications={notifications}
    />
  )
}