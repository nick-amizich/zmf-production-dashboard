import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { BuildRepository } from '@/lib/repositories/build-repository'
import { WorkerRepository } from '@/lib/repositories/worker-repository'
import { BuildService } from '@/lib/services/build-service'
import { ApiLogger } from '@/lib/api-logger'
import { logError } from '@/lib/logger'

export async function POST(
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
    const { newStage } = body

    if (!newStage) {
      const response = NextResponse.json(
        { error: 'Missing required field: newStage' },
        { status: 400 }
      )
      ApiLogger.logResponse(logContext, response, 'Missing required field')
      return response
    }

    const buildRepo = new BuildRepository(supabase)
    const workerRepo = new WorkerRepository(supabase)
    const buildService = new BuildService(buildRepo, workerRepo)

    const updatedBuild = await buildService.moveToStage(params.id, newStage, employee.id)

    const response = NextResponse.json({ data: updatedBuild })
    ApiLogger.logResponse(logContext, response, `Moved build ${params.id} to stage ${newStage}`)
    return response
  } catch (error) {
    logError(error as Error, 'API_ERROR', { 
      endpoint: `/api/builds/${params.id}/stage`,
      method: 'POST' 
    })
    const errorResponse = NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to move build stage' },
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to move build stage')
    return errorResponse
  }
}