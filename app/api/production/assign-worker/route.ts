import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { WorkerService } from '@/lib/services/worker-service'
import { ApiLogger } from '@/lib/api-logger'
import { logBusiness, logError } from '@/lib/logger'

export async function POST(request: Request) {
  const logContext = ApiLogger.logRequest(request)
  
  try {
    const supabase = await createClient()
    
    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      ApiLogger.logResponse(logContext, response, 'Unauthorized access attempt')
      return response
    }
    
    // Get worker (acting as employee)
    const { data: worker } = await supabase
      .from('workers')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
      
    if (!worker || !['admin', 'manager'].includes(worker.role)) {
      const response = NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      ApiLogger.logResponse(logContext, response, 'User lacks required role')
      return response
    }
    
    const body = await request.json()
    const { batchId, workerId, stage } = body
    
    if (!batchId || !workerId || !stage) {
      const response = NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
      ApiLogger.logResponse(logContext, response, 'Missing required fields')
      return response
    }
    
    const workerService = new WorkerService(supabase)
    const assignment = await workerService.assignWorkerToStage(
      batchId,
      workerId,
      stage
    )
    
    logBusiness(
      `Worker assigned to batch stage`,
      'BATCH_TRANSITION',
      {
        batchId,
        workerId,
        stage,
        assignedBy: worker.id
      }
    )
    
    const response = NextResponse.json(assignment)
    ApiLogger.logResponse(logContext, response, 'Worker assigned successfully')
    return response
  } catch (error) {
    logError(error as Error, 'API_ERROR', {
      endpoint: '/api/production/assign-worker',
      method: 'POST'
    })
    
    const response = NextResponse.json(
      { error: 'Failed to assign worker' },
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, response, 'Server error during assignment')
    return response
  }
}