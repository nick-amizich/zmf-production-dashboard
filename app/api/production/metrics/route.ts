import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { ApiLogger } from '@/lib/api-logger'
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

    // Verify employee has appropriate role
    const { data: employee } = await supabase
      .from('employees')
      .select('id, role, active')
      .eq('auth_user_id', user.id)
      .single()

    if (!employee?.active || !['manager', 'admin', 'worker'].includes(employee.role)) {
      const response = NextResponse.json({ error: 'Access denied' }, { status: 403 })
      ApiLogger.logResponse(logContext, response, 'Insufficient permissions')
      return response
    }

    // Calculate production metrics
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)
    
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    const lastWeekStart = new Date(weekStart)
    lastWeekStart.setDate(lastWeekStart.getDate() - 7)

    // Get current metrics
    const [
      activeBuilds,
      atRiskOrders,
      completedThisWeek,
      completedLastWeek,
      activeYesterday,
      atRiskYesterday,
      totalStaff,
      busyStaff
    ] = await Promise.all([
      // Active builds
      supabase
        .from('batches')
        .select('id', { count: 'exact' })
        .in('status', ['in_progress', 'quality_check']),
      
      // At-risk orders (due in next 3 days)
      supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .in('status', ['pending', 'processing'])
        .lte('expected_delivery_date', new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()),
      
      // Completed this week
      supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'shipped')
        .gte('updated_at', weekStart.toISOString()),
      
      // Completed last week
      supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'shipped')
        .gte('updated_at', lastWeekStart.toISOString())
        .lt('updated_at', weekStart.toISOString()),
      
      // Active builds yesterday
      supabase
        .from('batches')
        .select('id', { count: 'exact' })
        .in('status', ['in_progress', 'quality_check'])
        .lt('created_at', yesterday.toISOString()),
      
      // At-risk orders yesterday
      supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .in('status', ['pending', 'processing'])
        .lte('expected_delivery_date', new Date(yesterday.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString())
        .lt('created_at', yesterday.toISOString()),
      
      // Total active staff
      supabase
        .from('employees')
        .select('id')
        .eq('active', true)
        .eq('role', 'worker'),
      
      // Currently busy staff
      supabase
        .from('stage_assignments')
        .select('employee_id')
        .eq('is_active', true)
    ])

    // Calculate trends
    const activeBuildsTrend = (activeBuilds.count || 0) - (activeYesterday.count || 0)
    const atRiskTrend = (atRiskOrders.count || 0) - (atRiskYesterday.count || 0)
    const completedTrend = (completedLastWeek.count || 1) > 0 
      ? Math.round(((completedThisWeek.count || 0) - (completedLastWeek.count || 0)) / (completedLastWeek.count || 1) * 100)
      : 0

    // Calculate staff utilization
    const staffUtilization = totalStaff.data && totalStaff.data.length > 0
      ? Math.round((busyStaff.data?.length || 0) / totalStaff.data.length * 100)
      : 0

    const metrics = {
      activeBuilds: activeBuilds.count || 0,
      atRiskOrders: atRiskOrders.count || 0,
      completedThisWeek: completedThisWeek.count || 0,
      staffUtilization,
      activeBuildsTrend,
      atRiskTrend,
      completedTrend,
      timestamp: new Date().toISOString()
    }

    const response = NextResponse.json(metrics)
    ApiLogger.logResponse(logContext, response, 'Production metrics retrieved successfully')
    return response
  } catch (error) {
    logError(error as Error, 'PRODUCTION_METRICS', { endpoint: '/api/production/metrics' })
    const errorResponse = NextResponse.json(
      { error: 'Failed to fetch production metrics' }, 
      { status: 500 }
    )
    ApiLogger.logResponse(logContext, errorResponse, 'Failed to fetch production metrics')
    return errorResponse
  }
}