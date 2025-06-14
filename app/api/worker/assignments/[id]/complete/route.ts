import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { WorkerService } from '@/lib/services/worker-service'

import { logger } from '@/lib/logger'
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get worker
    const { data: worker } = await supabase
      .from('workers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
      
    if (!worker) {
      return NextResponse.json({ error: 'Worker not found' }, { status: 404 })
    }
    
    const body = await request.json()
    const { notes, qualityStatus = 'good', timeSpentMinutes } = body
    
    const workerService = new WorkerService(supabase)
    const assignment = await workerService.completeAssignment(
      params.id,
      worker.id,
      qualityStatus as 'good' | 'warning' | 'critical' | 'hold',
      timeSpentMinutes
    )
    
    // Create a notification for the completion
    await workerService.createNotification(
      worker.id,
      'achievement',
      'Task Completed!',
      'Great job completing your assignment.',
      { assignmentId: params.id }
    )
    
    return NextResponse.json(assignment)
  } catch (error) {
    logger.error('Error completing assignment:', error)
    return NextResponse.json(
      { error: 'Failed to complete assignment' },
      { status: 500 }
    )
  }
}