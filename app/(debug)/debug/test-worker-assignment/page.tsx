import { createClient } from '@/lib/supabase/server'
import { WorkerService } from '@/lib/services/worker-service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { revalidatePath } from 'next/cache'

export default async function TestWorkerAssignmentPage() {
  const supabase = await createClient()
  
  // Get first active batch
  const { data: batch } = await supabase
    .from('batches')
    .select('*')
    .eq('is_complete', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  
  // Get first active worker
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single()
  
  // Get existing assignments
  const { data: assignments } = await supabase
    .from('stage_assignments')
    .select(`
      *,
      batch:batches(*),
      worker:workers(*)
    `)
    .order('created_at', { ascending: false })
    .limit(10)

  async function createTestAssignment() {
    'use server'
    
    const supabase = await createClient()
    const workerService = new WorkerService(supabase)
    
    // Get first active batch and worker
    const { data: batch } = await supabase
      .from('batches')
      .select('*')
      .eq('is_complete', false)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    
    const { data: worker } = await supabase
      .from('workers')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()
    
    if (!batch || !worker) {
      throw new Error('No batch or worker found')
    }
    
    // Assign worker to current stage of batch
    await workerService.assignWorkerToStage(
      batch.id,
      worker.id,
      batch.current_stage
    )
    
    revalidatePath('/debug/test-worker-assignment')
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Test Worker Assignment</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current State</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Active Batch:</strong> {batch?.batch_number || 'None'}</p>
              <p><strong>Current Stage:</strong> {batch?.current_stage || 'N/A'}</p>
              <p><strong>Active Worker:</strong> {worker?.name || 'None'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Test Assignment</CardTitle>
          </CardHeader>
          <CardContent>
            {batch && worker ? (
              <form action={createTestAssignment}>
                <Button type="submit">
                  Assign {worker.name} to {batch.current_stage} stage of {batch.batch_number}
                </Button>
              </form>
            ) : (
              <p className="text-muted-foreground">
                No active batch or worker found. Create a batch and worker first.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Assignments</CardTitle>
          </CardHeader>
          <CardContent>
            {assignments && assignments.length > 0 ? (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="border p-3 rounded">
                    <p className="font-medium">
                      {assignment.worker?.name} - {assignment.stage} - {assignment.batch?.batch_number}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Started: {new Date(assignment.started_at).toLocaleString()}
                      {assignment.completed_at && (
                        <> | Completed: {new Date(assignment.completed_at).toLocaleString()}</>
                      )}
                    </p>
                    {assignment.quality_status && (
                      <p className="text-sm">Quality: {assignment.quality_status}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No assignments found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}