import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

import { logger } from '@/lib/logger'
export async function POST(request: NextRequest) {
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
    const { name, email, role, hourly_rate, specializations, active, send_invite } = body

    // Check if email already exists
    const { data: existingWorker } = await supabase
      .from('workers')
      .select('id')
      .eq('email', email)
      .single()

    if (existingWorker) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      )
    }

    // Create worker record
    const { data: newWorker, error: workerError } = await supabase
      .from('workers')
      .insert({
        name,
        email,
        role,
        hourly_rate,
        specializations: specializations || [],
        active,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (workerError) {
      logger.error('Error creating worker:', workerError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // If send_invite is true, create an auth user and send invite
    if (send_invite) {
      // Note: In production, you would use Supabase Admin API to create user
      // and send invite email. For now, we'll just create the worker record
      // and you can manually send invites through Supabase dashboard
      
      // TODO: Implement proper user invitation flow
      // const { data: authUser, error: authError } = await supabase.auth.admin.inviteUserByEmail(email)
    }

    // Log the action
    await supabase.from('audit_logs').insert({
      user_id: user.id,
      user_name: adminWorker.name,
      action_type: 'create',
      entity_type: 'worker',
      entity_id: newWorker.id,
      description: `Created new user ${name} (${role})`,
      metadata: { 
        new_user: {
          name,
          email,
          role,
          active
        }
      }
    })

    return NextResponse.json(newWorker)

  } catch (error) {
    logger.error('Error in POST /api/admin/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}