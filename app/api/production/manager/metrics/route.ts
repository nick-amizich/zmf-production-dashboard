import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiLogger } from '@/lib/api-logger'
import { ProductionManagerService } from '@/lib/services/production-manager-service'
import { logError } from '@/lib/logger'

export async function GET(request: NextRequest) {
  const logContext = ApiLogger.logRequest(request)
  
  try {
    const supabase = await createClient()
    
    // Verify user is authenticated and is a manager/admin
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      ApiLogger.logResponse(logContext, response, 'Unauthorized access attempt')
      return response
    }

    const { data: employee } = await supabase
      .from('employees')
      .select('id, role, active')
      .eq('auth_user_id', user.id)
      .single()

    if (!employee?.active || !['manager', 'admin'].includes(employee.role)) {
      const response = NextResponse.json({ error: 'Access denied' }, { status: 403 })
      ApiLogger.logResponse(logContext, response, 'Insufficient permissions')
      return response
    }

    // Get manager dashboard metrics
    const metrics = await ProductionManagerService.getDashboardMetrics()
    
    const response = NextResponse.json(metrics)
    ApiLogger.logResponse(logContext, response, 'Manager metrics retrieved successfully')
    return response
  } catch (error) {
    logError(error as Error, 'MANAGER_METRICS', { endpoint: '/api/production/manager/metrics' })
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch manager metrics' }, 
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to fetch manager metrics')
    return errorResponse
  }
}