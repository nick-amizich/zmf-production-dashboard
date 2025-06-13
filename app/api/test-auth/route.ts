import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

import { logger } from '@/lib/logger'
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      return NextResponse.json({ 
        error: 'Authentication error', 
        details: userError.message 
      }, { status: 401 })
    }

    if (!user) {
      return NextResponse.json({ 
        error: 'Not authenticated' 
      }, { status: 401 })
    }

    // Try to get the worker record
    const { data: worker, error: workerError } = await supabase
      .from('workers')
      .select('id, name, email, role, is_active')
      .eq('auth_user_id', user.id)
      .single()

    if (workerError) {
      return NextResponse.json({
        error: 'Worker lookup failed',
        details: workerError.message,
        user: {
          id: user.id,
          email: user.email
        }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        created_at: user.created_at
      },
      worker: worker
    })

  } catch (error) {
    logger.error('API Error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 