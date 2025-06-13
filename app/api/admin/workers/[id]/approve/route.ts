import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workerId = params.id

    // Check authentication using regular client
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if current user is a manager/admin
    const { data: currentWorker } = await supabase
      .from('workers')
      .select('role')
      .eq('auth_user_id', user.id)
      .single()

    if (!currentWorker || !['manager', 'admin'].includes(currentWorker.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Use service role for admin operations
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get the worker to approve
    const { data: worker, error: workerError } = await supabaseAdmin
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .single()

    if (workerError || !worker) {
      return NextResponse.json(
        { error: 'Worker not found' },
        { status: 404 }
      )
    }

    // Activate the worker
    const { error: updateError } = await supabaseAdmin
      .from('workers')
      .update({ 
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', workerId)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to activate worker' },
        { status: 500 }
      )
    }

    // Confirm the user's email in auth.users so they can log in
    if (worker.auth_user_id) {
      const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(
        worker.auth_user_id,
        { email_confirm: true }
      )

      if (confirmError) {
        console.error('Failed to confirm email:', confirmError)
        // Don't fail the whole operation if email confirmation fails
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Worker approved successfully'
    })

  } catch (error) {
    console.error('Worker approval error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 