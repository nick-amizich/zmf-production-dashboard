import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { WorkerService } from '@/lib/services/worker-service'

import { logger } from '@/lib/logger'
export async function PUT(request: Request) {
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
    const { date, isAvailable, shift, notes } = body
    
    const workerService = new WorkerService(supabase)
    const availability = await workerService.updateAvailability(
      worker.id,
      new Date(date),
      { isAvailable, shift, notes }
    )
    
    return NextResponse.json(availability)
  } catch (error) {
    logger.error('Error updating availability:', error)
    return NextResponse.json(
      { error: 'Failed to update availability' },
      { status: 500 }
    )
  }
}