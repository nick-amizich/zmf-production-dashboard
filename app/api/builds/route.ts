import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BuildRepository } from '@/lib/repositories/build-repository'
import { WorkerRepository } from '@/lib/repositories/worker-repository'
import { BuildService } from '@/lib/services/build-service'
import { ApiLogger } from '@/lib/api-logger'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const logContext = ApiLogger.logRequest(request)
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      ApiLogger.logResponse(logContext, response, 'Unauthorized access attempt')
      return response
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const filters = {
      status: searchParams.get('status') || undefined,
      stage: searchParams.get('stage') || undefined,
      assignedTo: searchParams.get('assignedTo') || undefined,
      orderId: searchParams.get('orderId') || undefined,
      search: searchParams.get('search') || undefined
    }

    const buildRepo = new BuildRepository(supabase)
    const workerRepo = new WorkerRepository(supabase)
    const buildService = new BuildService(buildRepo, workerRepo)

    const builds = await buildService.getBuilds(filters)

    const response = NextResponse.json({ data: builds })
    ApiLogger.logResponse(logContext, response, `Fetched ${builds.length} builds`)
    return response
  } catch (error) {
    logError(error as Error, 'API_ERROR', { 
      endpoint: '/api/builds',
      method: 'GET' 
    })
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch builds' },
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to fetch builds')
    return errorResponse
  }
}

export async function POST(request: NextRequest) {
  const logContext = ApiLogger.logRequest(request)
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      ApiLogger.logResponse(logContext, response, 'Unauthorized access attempt')
      return response
    }

    // Get employee
    const { data: employee } = await supabase
      .from('employees')
      .select('id, role, is_active')
      .eq('auth_user_id', user.id)
      .single()

    if (!employee?.is_active || !['manager', 'admin'].includes(employee.role)) {
      const response = NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      ApiLogger.logResponse(logContext, response, 'Insufficient permissions')
      return response
    }

    const body = await request.json()
    const { order_id, headphone_model_id, model_code, assigned_to, priority, target_completion_date, notes } = body

    if (!order_id || !headphone_model_id || !model_code) {
      const response = NextResponse.json(
        { error: 'Missing required fields: order_id, headphone_model_id, model_code' },
        { status: 400 }
      )
      ApiLogger.logResponse(logContext, response, 'Missing required fields')
      return response
    }

    const buildRepo = new BuildRepository(supabase)
    const workerRepo = new WorkerRepository(supabase)
    const buildService = new BuildService(buildRepo, workerRepo)

    const build = await buildService.createBuild({
      order_id,
      headphone_model_id,
      model_code,
      assigned_to,
      priority,
      target_completion_date,
      notes
    })

    const response = NextResponse.json({ data: build }, { status: 201 })
    ApiLogger.logResponse(logContext, response, `Created build ${build.serial_number}`)
    return response
  } catch (error) {
    logError(error as Error, 'API_ERROR', { 
      endpoint: '/api/builds',
      method: 'POST' 
    })
    const errorResponse = NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create build' },
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to create build')
    return errorResponse
  }
}