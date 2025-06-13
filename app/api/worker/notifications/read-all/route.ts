import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
    
    // Mark all notifications as read
    const { error } = await supabase
      .from('worker_notifications')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('worker_id', worker.id)
      .eq('is_read', false)
    
    if (error) throw error
    
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Error marking all notifications as read:', error)
    return NextResponse.json(
      { error: 'Failed to mark notifications as read' },
      { status: 500 }
    )
  }
}