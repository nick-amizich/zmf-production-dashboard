import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BuildRepository } from '@/lib/repositories/build-repository'
import { WorkerRepository } from '@/lib/repositories/worker-repository'
import { BuildService } from '@/lib/services/build-service'
import { ApiLogger } from '@/lib/api-logger'
import { logError } from '@/lib/logger'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const logContext = ApiLogger.logRequest(request)
  
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      ApiLogger.logResponse(logContext, response, 'Unauthorized access attempt')
      return response
    }

    const buildRepo = new BuildRepository(supabase)
    const workerRepo = new WorkerRepository(supabase)
    const buildService = new BuildService(buildRepo, workerRepo)

    const build = await buildService.getBuildById(params.id)

    const response = NextResponse.json({ data: build })
    ApiLogger.logResponse(logContext, response, `Fetched build ${params.id}`)
    return response
  } catch (error) {
    logError(error as Error, 'API_ERROR', { 
      endpoint: `/api/builds/${params.id}`,
      method: 'GET' 
    })
    const errorResponse = NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch build' },
      { status: error instanceof Error && error.message === 'Build not found' ? 404 : 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to fetch build')
    return errorResponse
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!employee?.is_active) {
      const response = NextResponse.json({ error: 'Inactive employee' }, { status: 403 })
      ApiLogger.logResponse(logContext, response, 'Inactive employee')
      return response
    }

    const body = await request.json()
    const buildRepo = new BuildRepository(supabase)
    const workerRepo = new WorkerRepository(supabase)
    const buildService = new BuildService(buildRepo, workerRepo)

    const updatedBuild = await buildService.updateBuild(params.id, body, employee.id)

    const response = NextResponse.json({ data: updatedBuild })
    ApiLogger.logResponse(logContext, response, `Updated build ${params.id}`)
    return response
  } catch (error) {
    logError(error as Error, 'API_ERROR', { 
      endpoint: `/api/builds/${params.id}`,
      method: 'PATCH' 
    })
    const errorResponse = NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update build' },
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to update build')
    return errorResponse
  }
}