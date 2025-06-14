import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export interface ProductionStageData {
  id: string
  name: string
  activeOrders: number
  capacity: number
  averageTime: string
  bottleneck: boolean
  workers: Array<{
    id: string
    name: string
    status: 'working' | 'available' | 'break'
    currentOrder?: string
    timeElapsed?: string
  }>
  alerts: Array<{
    type: 'warning' | 'error' | 'info'
    message: string
    orderId?: string
  }>
}

export interface ManagerDashboardMetrics {
  activeOrders: {
    count: number
    status: 'good' | 'warning' | 'critical'
    breakdown: { onTrack: number; delayed: number; critical: number }
  }
  dailyProgress: {
    completed: number
    target: number
    percentage: number
  }
  qualityStatus: {
    rate: number
    trend: 'up' | 'down' | 'stable'
    change: number
  }
  workerStatus: {
    active: number
    total: number
    breakdown: { working: number; available: number; break: number; offline: number }
  }
  upcomingDeadlines: {
    tomorrow: number
    thisWeek: number
    urgency: 'low' | 'medium' | 'high'
  }
}

export class ProductionManagerService {
  static async getDashboardMetrics(): Promise<ManagerDashboardMetrics> {
    const supabase = await createClient()
    
    try {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() + 7)
      const todayStart = new Date(now)
      todayStart.setHours(0, 0, 0, 0)

      // Get active orders with their status
      const { data: activeOrders } = await supabase
        .from('orders')
        .select('*, batch_orders!inner(batches!inner(current_stage))')
        .in('status', ['pending', 'processing', 'quality_check'])

      const orderBreakdown = {
        onTrack: 0,
        delayed: 0,
        critical: 0
      }

      activeOrders?.forEach(order => {
        if (order.expected_delivery_date) {
          const dueDate = new Date(order.expected_delivery_date)
          const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
          
          if (daysUntilDue < 0) {
            orderBreakdown.critical++
          } else if (daysUntilDue < 3) {
            orderBreakdown.delayed++
          } else {
            orderBreakdown.onTrack++
          }
        } else {
          orderBreakdown.onTrack++
        }
      })

      // Get daily progress
      const { count: completedToday } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'shipped')
        .gte('updated_at', todayStart.toISOString())

      // Get quality metrics
      const { data: qualityChecks } = await supabase
        .from('quality_checks')
        .select('passed')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

      const passedChecks = qualityChecks?.filter(qc => qc.passed).length || 0
      const totalChecks = qualityChecks?.length || 1
      const qualityRate = (passedChecks / totalChecks) * 100

      // Get worker status
      const { data: allWorkers } = await supabase
        .from('employees')
        .select(`
          id,
          name,
          status,
          active,
          stage_assignments(
            is_active,
            stage,
            batch_id
          )
        `)
        .eq('role', 'worker')
        .eq('active', true)

      const workerBreakdown = {
        working: 0,
        available: 0,
        break: 0,
        offline: 0
      }

      allWorkers?.forEach(worker => {
        if (!worker.active) {
          workerBreakdown.offline++
        } else if (worker.stage_assignments?.some(sa => sa.is_active)) {
          workerBreakdown.working++
        } else if (worker.status === 'break') {
          workerBreakdown.break++
        } else {
          workerBreakdown.available++
        }
      })

      // Get upcoming deadlines
      const { count: dueTomorrow } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .in('status', ['pending', 'processing'])
        .lte('expected_delivery_date', tomorrow.toISOString())
        .gte('expected_delivery_date', now.toISOString())

      const { count: dueThisWeek } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .in('status', ['pending', 'processing'])
        .lte('expected_delivery_date', weekEnd.toISOString())
        .gte('expected_delivery_date', now.toISOString())

      const activeOrderCount = activeOrders?.length || 0
      const orderStatus = orderBreakdown.critical > 0 ? 'critical' : 
                         orderBreakdown.delayed > 2 ? 'warning' : 'good'

      const urgency = (dueTomorrow || 0) > 3 ? 'high' : 
                     (dueThisWeek || 0) > 10 ? 'medium' : 'low'

      return {
        activeOrders: {
          count: activeOrderCount,
          status: orderStatus,
          breakdown: orderBreakdown
        },
        dailyProgress: {
          completed: completedToday || 0,
          target: 12, // This could be configurable
          percentage: Math.min(100, Math.round(((completedToday || 0) / 12) * 100))
        },
        qualityStatus: {
          rate: Math.round(qualityRate * 10) / 10,
          trend: 'stable', // Would need historical data to calculate
          change: 0
        },
        workerStatus: {
          active: workerBreakdown.working + workerBreakdown.available + workerBreakdown.break,
          total: allWorkers?.length || 0,
          breakdown: workerBreakdown
        },
        upcomingDeadlines: {
          tomorrow: dueTomorrow || 0,
          thisWeek: dueThisWeek || 0,
          urgency
        }
      }
    } catch (error) {
      logger.error('Failed to fetch dashboard metrics', error)
      throw error
    }
  }

  static async getProductionStages(): Promise<ProductionStageData[]> {
    const supabase = await createClient()
    
    try {
      // Define stage configuration
      const stages = [
        { id: 'cups', name: 'Cups', capacity: 6 },
        { id: 'sanding', name: 'Sanding', capacity: 8 },
        { id: 'finishing', name: 'Finishing', capacity: 4 },
        { id: 'sub_assembly', name: 'Sub-Assembly', capacity: 6 },
        { id: 'final_assembly', name: 'Final Assembly', capacity: 5 },
        { id: 'quality_control', name: 'Quality Control', capacity: 4 },
        { id: 'packaging', name: 'Packaging', capacity: 3 }
      ]

      // Get all active batches with their stage assignments
      const { data: batches } = await supabase
        .from('batches')
        .select(`
          id,
          batch_number,
          current_stage,
          created_at,
          stage_assignments!inner(
            stage,
            assigned_at,
            is_active,
            employee_id,
            employees!inner(
              id,
              name,
              status
            )
          ),
          batch_orders!inner(
            orders!inner(
              order_number,
              expected_delivery_date
            )
          )
        `)
        .in('status', ['in_progress', 'quality_check'])

      // Get recent issues by stage
      const { data: recentIssues } = await supabase
        .from('issues')
        .select(`
          id,
          description,
          severity,
          stage,
          batch_id,
          created_at
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

      // Calculate metrics for each stage
      const stageData: ProductionStageData[] = stages.map(stage => {
        // Count active orders in this stage
        const activeInStage = batches?.filter(b => b.current_stage === stage.id) || []
        
        // Get workers assigned to this stage
        const stageWorkers = new Map()
        batches?.forEach(batch => {
          batch.stage_assignments
            ?.filter(sa => sa.stage === stage.id && sa.is_active)
            .forEach(sa => {
              const assignedAt = new Date(sa.assigned_at)
              const timeElapsed = formatTimeElapsed(assignedAt)
              
              stageWorkers.set(sa.employee_id, {
                id: sa.employees.id,
                name: sa.employees.name,
                status: 'working' as const,
                currentOrder: batch.batch_orders?.[0]?.orders?.order_number,
                timeElapsed
              })
            })
        })

        // Get available workers who can work on this stage
        // This is simplified - in reality you'd check worker skills
        const availableWorkers: any[] = [] // Would fetch from employees table

        // Get alerts for this stage
        const stageAlerts = recentIssues
          ?.filter(issue => issue.stage === stage.id)
          .map(issue => ({
            type: issue.severity === 'critical' ? 'error' as const : 
                  issue.severity === 'high' ? 'warning' as const : 'info' as const,
            message: issue.description,
            orderId: issue.batch_id
          })) || []

        // Check for capacity warnings
        const utilizationRate = activeInStage.length / stage.capacity
        if (utilizationRate > 0.75) {
          stageAlerts.push({
            type: 'warning',
            message: `Capacity at ${Math.round(utilizationRate * 100)}% - consider reassignment`
          })
        }

        // Calculate average time (placeholder - would need historical data)
        const averageHours = Math.random() * 4 + 2
        
        return {
          id: stage.id,
          name: stage.name,
          activeOrders: activeInStage.length,
          capacity: stage.capacity,
          averageTime: `${averageHours.toFixed(1)}h`,
          bottleneck: utilizationRate > 0.8,
          workers: Array.from(stageWorkers.values()).concat(availableWorkers),
          alerts: stageAlerts
        }
      })

      return stageData
    } catch (error) {
      logger.error('Failed to fetch production stages', error)
      throw error
    }
  }

  static async getRecentAlerts(limit: number = 10) {
    const supabase = await createClient()
    
    try {
      const { data: alerts } = await supabase
        .from('system_logs')
        .select('*')
        .in('level', ['error', 'warn'])
        .order('created_at', { ascending: false })
        .limit(limit)

      return alerts || []
    } catch (error) {
      logger.error('Failed to fetch recent alerts', error)
      return []
    }
  }
}

function formatTimeElapsed(startTime: Date): string {
  const now = new Date()
  const diff = now.getTime() - startTime.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}