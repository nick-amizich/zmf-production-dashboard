import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { WorkerService } from '@/lib/services/worker-service'

import { logger } from '@/lib/logger'
export async function PUT(
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
    
    const workerService = new WorkerService(supabase)
    await workerService.markNotificationRead(params.id, worker.id)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error marking notification as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notification as read' },
      { status: 500 }
    )
  }
}