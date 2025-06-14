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

    // Get quality issues
    const issues = await ProductionDashboardService.getQualityIssues()
    
    const response = NextResponse.json(issues)
    ApiLogger.logResponse(logContext, response, 'Quality issues retrieved successfully')
    return response
  } catch (error) {
    logError(error as Error, 'PRODUCTION_QUALITY_ISSUES', { endpoint: '/api/production/quality-issues' })
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch quality issues' }, 
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to fetch quality issues')
    return errorResponse
  }
}