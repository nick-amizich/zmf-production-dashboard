import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiLogger } from '@/lib/api-logger'
import { ProductionDashboardService } from '@/lib/services/production-dashboard-service'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const logContext = ApiLogger.logRequest(request)
  
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      ApiLogger.logResponse(logContext, response, 'Unauthorized access attempt')
      return response
    }

    // Get worker statuses
    const workers = await ProductionDashboardService.getWorkerStatuses()
    
    const response = NextResponse.json(workers)
    ApiLogger.logResponse(logContext, response, 'Worker statuses retrieved successfully')
    return response
  } catch (error) {
    logError(error as Error, 'PRODUCTION_WORKERS', { endpoint: '/api/production/workers' })
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch worker statuses' }, 
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to fetch worker statuses')
    return errorResponse
  }
}