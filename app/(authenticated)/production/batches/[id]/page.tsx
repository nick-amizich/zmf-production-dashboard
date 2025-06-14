import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { WorkerService } from '@/lib/services/worker-service'
import { BatchDetailView } from '@/components/production/batch-detail-view'

export default async function BatchDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Get worker/employee
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!worker || !['admin', 'manager'].includes(worker.role)) {
    redirect('/dashboard')
  }
  
  // Get batch with assignments
  const workerService = new WorkerService(supabase)
  const batchData = await workerService.getBatchWithAssignments(params.id)
  
  // Get available workers for each stage
  const availableWorkers = await workerService.getAvailableWorkers(batchData.current_stage)
  
  return (
    <div className="container mx-auto p-6">
      <BatchDetailView 
        batch={batchData} 
        availableWorkers={availableWorkers}
        employeeId={worker.id}
      />
    </div>
  )
}