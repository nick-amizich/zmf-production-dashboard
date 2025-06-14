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

    // Get order statuses
    const orders = await ProductionDashboardService.getOrderStatuses()
    
    const response = NextResponse.json(orders)
    ApiLogger.logResponse(logContext, response, 'Order statuses retrieved successfully')
    return response
  } catch (error) {
    logError(error as Error, 'PRODUCTION_ORDERS', { endpoint: '/api/production/orders' })
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch order statuses' }, 
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to fetch order statuses')
    return errorResponse
  }
}