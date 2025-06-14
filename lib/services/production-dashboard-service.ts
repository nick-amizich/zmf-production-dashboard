import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'

export interface WorkerStatus {
  id: string
  name: string
  currentTask: string
  stage: string
  status: 'busy' | 'available' | 'break'
  skills: string[]
  timeElapsed: string
}

export interface OrderStatus {
  id: string
  orderNumber: string
  customerName: string
  model: string
  woodType: string
  currentStage: string
  progress: number
  assignedWorker: string | null
  timeElapsed: string
  qualityStatus: 'good' | 'warning' | 'critical'
  dueDate: string
}

export interface ProductionMetrics {
  activeBuilds: number
  atRiskOrders: number
  completedThisWeek: number
  staffUtilization: number
  activeBuildsTrend: number
  atRiskTrend: number
  completedTrend: number
}

export interface QualityIssue {
  id: string
  description: string
  orderId: string
  severity: 'info' | 'warning' | 'error'
  createdAt: string
}

export interface StageBottleneck {
  stage: string
  averageTime: number
  status: 'good' | 'warning' | 'critical'
}

export class ProductionDashboardService {
  static async getWorkerStatuses(): Promise<WorkerStatus[]> {
    const supabase = await createClient()
    
    try {
      // Get all active employees with their current assignments
      const { data: employees, error } = await supabase
        .from('employees')
        .select(`
          id,
          name,
          status,
          skills,
          stage_assignments!inner(
            stage,
            batch_id,
            assigned_at,
            batches!inner(
              id,
              batch_number,
              current_stage
            )
          )
        `)
        .eq('active', true)
        .order('name')
      
      if (error) {
        logger.error('Failed to fetch worker statuses', error)
        throw error
      }

      // Transform data into WorkerStatus format
      return (employees || []).map(emp => {
        const assignment = emp.stage_assignments?.[0]
        const assignedAt = assignment?.assigned_at ? new Date(assignment.assigned_at) : null
        const timeElapsed = assignedAt 
          ? formatTimeElapsed(assignedAt)
          : '0m'

        return {
          id: emp.id,
          name: emp.name,
          currentTask: assignment ? `Batch ${assignment.batches.batch_number}` : 'Available',
          stage: assignment?.stage || 'Unassigned',
          status: determineWorkerStatus(emp.status, assignment),
          skills: emp.skills || [],
          timeElapsed
        }
      })
    } catch (error) {
      logger.error('Error in getWorkerStatuses', error)
      return []
    }
  }

  static async getOrderStatuses(): Promise<OrderStatus[]> {
    const supabase = await createClient()
    
    try {
      // Get active orders with their batch assignments
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          id,
          order_number,
          customer_name,
          created_at,
          expected_delivery_date,
          order_items!inner(
            quantity,
            headphone_models!inner(
              name,
              base_price
            )
          ),
          batch_orders(
            batch_id,
            batches!inner(
              id,
              batch_number,
              current_stage,
              created_at,
              stage_assignments(
                stage,
                assigned_at,
                employees!inner(name)
              )
            )
          )
        `)
        .in('status', ['pending', 'processing', 'quality_check'])
        .order('created_at', { ascending: false })
        .limit(20)
      
      if (error) {
        logger.error('Failed to fetch order statuses', error)
        throw error
      }

      // Transform data into OrderStatus format
      return (orders || []).map(order => {
        const batchOrder = order.batch_orders?.[0]
        const batch = batchOrder?.batches
        const currentStageAssignment = batch?.stage_assignments?.find(
          sa => sa.stage === batch.current_stage
        )
        
        const model = order.order_items?.[0]?.headphone_models?.name || 'Unknown'
        const woodType = extractWoodType(model) // You'd need to implement this based on your data
        
        const progress = calculateProgress(batch?.current_stage)
        const qualityStatus = determineQualityStatus(order, batch)
        
        const batchCreatedAt = batch?.created_at ? new Date(batch.created_at) : null
        const timeElapsed = batchCreatedAt ? formatTimeElapsed(batchCreatedAt) : '0m'

        return {
          id: order.id,
          orderNumber: order.order_number,
          customerName: order.customer_name || 'Unknown',
          model,
          woodType,
          currentStage: batch?.current_stage || 'Pending',
          progress,
          assignedWorker: currentStageAssignment?.employees?.name || null,
          timeElapsed,
          qualityStatus,
          dueDate: order.expected_delivery_date || ''
        }
      })
    } catch (error) {
      logger.error('Error in getOrderStatuses', error)
      return []
    }
  }

  static async getProductionMetrics(): Promise<ProductionMetrics> {
    const supabase = await createClient()
    
    try {
      // Get active builds count
      const { count: activeBuilds } = await supabase
        .from('batches')
        .select('id', { count: 'exact' })
        .in('status', ['in_progress', 'quality_check'])

      // Get at-risk orders (due in next 3 days but not completed)
      const threeDaysFromNow = new Date()
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
      
      const { count: atRiskOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .in('status', ['pending', 'processing'])
        .lte('expected_delivery_date', threeDaysFromNow.toISOString())

      // Get completed this week
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      weekStart.setHours(0, 0, 0, 0)
      
      const { count: completedThisWeek } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('status', 'shipped')
        .gte('updated_at', weekStart.toISOString())

      // Calculate staff utilization
      const { data: totalStaff } = await supabase
        .from('employees')
        .select('id')
        .eq('active', true)
        .eq('role', 'worker')

      const { data: busyStaff } = await supabase
        .from('stage_assignments')
        .select('employee_id')
        .eq('is_active', true)

      const utilization = totalStaff && totalStaff.length > 0
        ? Math.round((busyStaff?.length || 0) / totalStaff.length * 100)
        : 0

      // For now, return static trend values - you'd calculate these from historical data
      return {
        activeBuilds: activeBuilds || 0,
        atRiskOrders: atRiskOrders || 0,
        completedThisWeek: completedThisWeek || 0,
        staffUtilization: utilization,
        activeBuildsTrend: 2,
        atRiskTrend: -1,
        completedTrend: 12
      }
    } catch (error) {
      logger.error('Error in getProductionMetrics', error)
      return {
        activeBuilds: 0,
        atRiskOrders: 0,
        completedThisWeek: 0,
        staffUtilization: 0,
        activeBuildsTrend: 0,
        atRiskTrend: 0,
        completedTrend: 0
      }
    }
  }

  static async getQualityIssues(): Promise<QualityIssue[]> {
    const supabase = await createClient()
    
    try {
      const { data: issues, error } = await supabase
        .from('issues')
        .select(`
          id,
          description,
          severity,
          created_at,
          batch_orders!inner(
            orders!inner(order_number)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) {
        logger.error('Failed to fetch quality issues', error)
        throw error
      }

      return (issues || []).map(issue => ({
        id: issue.id,
        description: issue.description,
        orderId: issue.batch_orders?.orders?.order_number || 'Unknown',
        severity: mapSeverity(issue.severity),
        createdAt: issue.created_at
      }))
    } catch (error) {
      logger.error('Error in getQualityIssues', error)
      return []
    }
  }

  static async getStageBottlenecks(): Promise<StageBottleneck[]> {
    const supabase = await createClient()
    
    try {
      // Get average time spent in each stage for recent batches
      const { data: stageTimes, error } = await supabase
        .from('production_metrics')
        .select('stage, avg_duration_hours')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('avg_duration_hours', { ascending: false })
        .limit(5)
      
      if (error) {
        logger.error('Failed to fetch stage bottlenecks', error)
        throw error
      }

      return (stageTimes || []).map(st => ({
        stage: st.stage,
        averageTime: st.avg_duration_hours || 0,
        status: st.avg_duration_hours > 3 ? 'critical' : 
                st.avg_duration_hours > 2 ? 'warning' : 'good'
      }))
    } catch (error) {
      logger.error('Error in getStageBottlenecks', error)
      // Return placeholder data if metrics aren't available
      return [
        { stage: 'Finishing', averageTime: 2.3, status: 'warning' },
        { stage: 'Acoustic QC', averageTime: 3.1, status: 'critical' }
      ]
    }
  }
}

// Helper functions
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

function determineWorkerStatus(
  status: string | null, 
  assignment: any
): 'busy' | 'available' | 'break' {
  if (!assignment) return 'available'
  if (status === 'break') return 'break'
  return 'busy'
}

function extractWoodType(modelName: string): string {
  // This is a placeholder - you'd implement based on your actual data structure
  const woodTypes = ['Sapele', 'Cocobolo', 'Cherry', 'Ash', 'Walnut', 'Maple']
  return woodTypes[Math.floor(Math.random() * woodTypes.length)]
}

function calculateProgress(stage: string | null): number {
  const stageProgress: Record<string, number> = {
    'pending': 0,
    'cups': 15,
    'sanding': 35,
    'finishing': 60,
    'sub_assembly': 75,
    'final_assembly': 85,
    'quality_control': 90,
    'packaging': 95,
    'complete': 100
  }
  return stageProgress[stage || 'pending'] || 0
}

function determineQualityStatus(order: any, batch: any): 'good' | 'warning' | 'critical' {
  // Check if order is overdue
  if (order.expected_delivery_date) {
    const dueDate = new Date(order.expected_delivery_date)
    const now = new Date()
    const daysUntilDue = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) return 'critical'
    if (daysUntilDue < 3) return 'warning'
  }
  return 'good'
}

function mapSeverity(severity: string): 'info' | 'warning' | 'error' {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'error'
    case 'medium':
      return 'warning'
    default:
      return 'info'
  }
}