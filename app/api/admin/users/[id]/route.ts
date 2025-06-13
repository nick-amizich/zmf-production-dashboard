import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { logger } from '@/lib/logger'
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminWorker } = await supabase
      .from('workers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
      
    if (!adminWorker || adminWorker.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Parse request body
    const body = await request.json()
    const { name, email, role, hourly_rate, active, specializations } = body

    // Update worker
    const { data: updatedWorker, error } = await supabase
      .from('workers')
      .update({
        name,
        email,
        role,
        hourly_rate,
        active,
        specializations,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      logger.error('Error updating worker:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_name: adminWorker.name,
      action_type: 'update',
      entity_type: 'worker',
      entity_id: params.id,
      description: `Updated user ${name}`,
      metadata: { changes: body }
    })

    return NextResponse.json(updatedWorker)

  } catch (error) {
    logger.error('Error in PATCH /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminWorker } = await supabase
      .from('workers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
      
    if (!adminWorker || adminWorker.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get worker info before deletion
    const { data: workerToDelete } = await supabase
      .from('workers')
      .select('*')
      .eq('id', params.id)
      .single()

    if (!workerToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Prevent deleting yourself
    if (workerToDelete.auth_user_id === user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    // Delete worker
    const { error } = await supabase
      .from('workers')
      .delete()
      .eq('id', params.id)

    if (error) {
      logger.error('Error deleting worker:', error)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_name: adminWorker.name,
      action_type: 'delete',
      entity_type: 'worker',
      entity_id: params.id,
      description: `Deleted user ${workerToDelete.name}`,
      metadata: { deleted_user: workerToDelete }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    logger.error('Error in DELETE /api/admin/users/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}