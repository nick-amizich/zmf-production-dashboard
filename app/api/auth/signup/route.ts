import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    // Create a Supabase client with service role for admin operations
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Create the auth user (but don't auto-confirm for approval workflow)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Don't auto-confirm - they need approval first
      user_metadata: {
        full_name: name,
      }
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create the worker record as INACTIVE (needs manager approval)
    const { error: workerError } = await supabaseAdmin
      .from('workers')
      .insert({
        auth_user_id: authData.user.id,
        email: email,
        name: name,
        role: 'worker',
        is_active: false // INACTIVE until approved by manager
      })

    if (workerError) {
      // If worker creation fails, try to delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Failed to create worker profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully! Your registration is pending approval by a manager. You will be notified once approved.'
    })

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 