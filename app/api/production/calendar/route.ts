import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiLogger } from '@/lib/api-logger'
import { ProductionCalendarService } from '@/lib/services/production-calendar-service'
import { logError, logBusiness } from '@/lib/logger'

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

    // Get date range from query params
    const { searchParams } = new URL(request.url)
    const startDateStr = searchParams.get('startDate')
    const endDateStr = searchParams.get('endDate')

    if (!startDateStr || !endDateStr) {
      const response = NextResponse.json(
        { error: 'startDate and endDate are required' }, 
        { status: 400 }
      )
      ApiLogger.logResponse(logContext, response, 'Missing date parameters')
      return response
    }

    const startDate = new Date(startDateStr)
    const endDate = new Date(endDateStr)

    // Get calendar data
    const calendarData = await ProductionCalendarService.getCalendarData(startDate, endDate)
    
    const response = NextResponse.json(calendarData)
    ApiLogger.logResponse(logContext, response, 'Calendar data retrieved successfully')
    return response
  } catch (error) {
    logError(error as Error, 'PRODUCTION_CALENDAR', { endpoint: '/api/production/calendar' })
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch calendar data' }, 
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to fetch calendar data')
    return errorResponse
  }
}

export async function POST(request: NextRequest) {
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

    // Verify user is a manager/admin
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

    const body = await request.json()
    const { workerId, batchId, date, stage, hours } = body

    if (!workerId || !batchId || !date || !stage || !hours) {
      const response = NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
      ApiLogger.logResponse(logContext, response, 'Missing assignment fields')
      return response
    }

    // Create assignment
    const assignment = await ProductionCalendarService.createAssignment(
      workerId,
      batchId,
      date,
      stage,
      hours
    )

    logBusiness('Calendar assignment created', 'PRODUCTION_CALENDAR', {
      assignmentId: assignment.id,
      workerId,
      batchId,
      date,
      createdBy: employee.id
    })

    const response = NextResponse.json(assignment)
    ApiLogger.logResponse(logContext, response, 'Assignment created successfully')
    return response
  } catch (error) {
    logError(error as Error, 'PRODUCTION_CALENDAR', { 
      endpoint: '/api/production/calendar',
      method: 'POST'
    })
    const errorResponse = NextResponse.json(
      { error: 'Failed to create assignment' }, 
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to create assignment')
    return errorResponse
  }
}