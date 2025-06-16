import { createClient } from '@/lib/supabase/server'
import { Database } from '@/types/database.types'
import { startOfWeek, startOfMonth, endOfWeek, endOfMonth, subDays, format } from 'date-fns'

type ProductionStage = Database['public']['Enums']['production_stage']

export interface ProductionAnalytics {
  totalOrders: number
  completedOrders: number
  inProgressOrders: number
  averageCompletionTime: number
  onTimeDeliveryRate: number
  ordersByStage: Record<ProductionStage, number>
  ordersByPriority: Record<string, number>
  dailyProduction: Array<{ date: string; completed: number; started: number }>
  topModels: Array<{ model: string; count: number; revenue: number }>
}

export interface QualityAnalytics {
  overallPassRate: number
  passRateByStage: Record<ProductionStage, number>
  commonIssues: Array<{ category: string; count: number; percentage: number }>
  qualityTrend: Array<{ date: string; passRate: number; checks: number }>
  workerQualityScores: Array<{ worker: string; passRate: number; checks: number }>
  criticalIssues: number
  resolvedIssues: number
  avgResolutionTime: number
}

export interface WorkerAnalytics {
  totalWorkers: number
  activeWorkers: number
  utilizationRate: number
  topPerformers: Array<{ worker: any; score: number; metrics: any }>
  productivityByStage: Record<ProductionStage, { workers: number; avgOutput: number }>
  attendanceRate: number
  skillDistribution: Record<ProductionStage, number>
}

export interface RevenueAnalytics {
  totalRevenue: number
  revenueByModel: Record<string, number>
  revenueByMonth: Array<{ month: string; revenue: number; orders: number }>
  averageOrderValue: number
  projectedRevenue: number
  topCustomers: Array<{ customer: string; orders: number; revenue: number }>
}

export class AnalyticsService {
  constructor(private supabase: Awaited<ReturnType<typeof createClient>>) {}

  /**
   * Get comprehensive analytics dashboard data
   */
  async getDashboardAnalytics(
    startDate: Date = subDays(new Date(), 30),
    endDate: Date = new Date()
  ) {
    const [production, quality, worker, revenue] = await Promise.all([
      this.getProductionAnalytics(startDate, endDate),
      this.getQualityAnalytics(startDate, endDate),
      this.getWorkerAnalytics(startDate, endDate),
      this.getRevenueAnalytics(startDate, endDate),
    ])

    return {
      production,
      quality,
      worker,
      revenue,
      period: {
        start: startDate,
        end: endDate,
      },
    }
  }

  /**
   * Get production analytics
   */
  async getProductionAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<ProductionAnalytics> {
    // Get all orders in date range
    const { data: orders } = await this.supabase
      .from('orders')
      .select(`
        *,
        model:headphone_models(*),
        customer:customers(*),
        batches:batch_orders(
          batch:batches(*)
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (!orders) {
      return this.getEmptyProductionAnalytics()
    }

    // Calculate metrics
    const totalOrders = orders.length
    const completedOrders = orders.filter(o => o.status === 'completed').length
    const inProgressOrders = orders.filter(o => 
      o.status && ['pending', 'in_production'].includes(o.status)
    ).length

    // Average completion time (in days) - using updated_at as proxy for completion
    const completedWithTime = orders.filter(o => 
      o.status === 'completed' && o.updated_at && o.created_at
    )
    const avgCompletionTime = completedWithTime.length > 0
      ? completedWithTime.reduce((sum, order) => {
          const start = new Date(order.created_at!)
          const end = new Date(order.updated_at!)
          return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        }, 0) / completedWithTime.length
      : 0

    // On-time delivery rate - since we don't have due_date field, default to 100%
    const onTimeDeliveryRate = 100

    // Orders by stage
    const { data: batches } = await this.supabase
      .from('batches')
      .select('current_stage')
      .eq('is_complete', false)

    const ordersByStage = (batches || []).reduce((acc, batch) => {
      if (batch.current_stage) {
        acc[batch.current_stage] = (acc[batch.current_stage] || 0) + 1
      }
      return acc
    }, {} as Record<ProductionStage, number>)

    // Orders by priority
    const ordersByPriority = orders.reduce((acc, order) => {
      const priority = order.priority || 'standard'
      acc[priority] = (acc[priority] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Daily production
    const dailyProduction = await this.getDailyProduction(startDate, endDate)

    // Top models (assuming 1 unit per order since quantity field doesn't exist)
    const modelCounts = orders.reduce((acc, order) => {
      if (order.model) {
        const key = order.model.name
        if (!acc[key]) {
          acc[key] = { count: 0, revenue: 0 }
        }
        acc[key].count += 1 // Each order is 1 unit
        // Revenue calculation would require price data - using placeholder
        acc[key].revenue += 0 // Price data not available in current schema
      }
      return acc
    }, {} as Record<string, { count: number; revenue: number }>)

    const topModels = Object.entries(modelCounts)
      .map(([model, data]) => ({ model, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    return {
      totalOrders,
      completedOrders,
      inProgressOrders,
      averageCompletionTime: avgCompletionTime,
      onTimeDeliveryRate,
      ordersByStage,
      ordersByPriority,
      dailyProduction,
      topModels,
    }
  }

  /**
   * Get quality analytics
   */
  async getQualityAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<QualityAnalytics> {
    // Get quality checks
    const { data: qualityChecks } = await this.supabase
      .from('quality_checks')
      .select(`
        *,
        worker:workers(name)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    // Get issues
    const { data: issues } = await this.supabase
      .from('issues')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (!qualityChecks || !issues) {
      return this.getEmptyQualityAnalytics()
    }

    // Overall pass rate
    const totalChecks = qualityChecks.length
    const passedChecks = qualityChecks.filter(c => c.overall_status === 'good').length
    const overallPassRate = totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 100

    // Pass rate by stage
    const passRateByStage = this.calculatePassRateByStage(qualityChecks)

    // Common issues
    const issueCounts = issues.reduce((acc, issue) => {
      acc[issue.category] = (acc[issue.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalIssues = issues.length
    const commonIssues = Object.entries(issueCounts)
      .map(([category, count]) => ({
        category,
        count,
        percentage: totalIssues > 0 ? (count / totalIssues) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Quality trend
    const qualityTrend = await this.getQualityTrend(startDate, endDate)

    // Worker quality scores
    const workerScores = this.calculateWorkerQualityScores(qualityChecks)

    // Issue metrics
    const criticalIssues = issues.filter(i => i.severity === 'critical').length
    const resolvedIssues = issues.filter(i => i.is_resolved).length
    
    const resolvedWithTime = issues.filter(i => i.is_resolved && i.resolved_at && i.created_at)
    const avgResolutionTime = resolvedWithTime.length > 0
      ? resolvedWithTime.reduce((sum, issue) => {
          const created = new Date(issue.created_at!)
          const resolved = new Date(issue.resolved_at!)
          return sum + (resolved.getTime() - created.getTime()) / (1000 * 60 * 60)
        }, 0) / resolvedWithTime.length
      : 0

    return {
      overallPassRate,
      passRateByStage,
      commonIssues,
      qualityTrend,
      workerQualityScores: workerScores,
      criticalIssues,
      resolvedIssues,
      avgResolutionTime,
    }
  }

  /**
   * Get worker analytics
   */
  async getWorkerAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<WorkerAnalytics> {
    // Get all workers
    const { data: workers } = await this.supabase
      .from('workers')
      .select('*')
      .eq('is_active', true)

    // Get production metrics
    const { data: metrics } = await this.supabase
      .from('production_metrics')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    // Get availability data
    const { data: availability } = await this.supabase
      .from('worker_availability')
      .select('*')
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', endDate.toISOString().split('T')[0])

    if (!workers || !metrics) {
      return this.getEmptyWorkerAnalytics()
    }

    const totalWorkers = workers.length
    const activeWorkers = new Set(metrics.map(m => m.worker_id)).size

    // Calculate utilization
    const totalCapacity = totalWorkers * 8 * 30 // 8 hours/day, 30 days
    const totalWorked = metrics.reduce((sum, m) => sum + (m.total_time_minutes || 0), 0) / 60
    const utilizationRate = (totalWorked / totalCapacity) * 100

    // Top performers
    const topPerformers = await this.getTopPerformers(workers, metrics)

    // Productivity by stage
    const productivityByStage = this.calculateProductivityByStage(metrics)

    // Attendance rate
    const totalDays = availability?.length || 0
    const presentDays = availability?.filter(a => a.is_available).length || 0
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 100

    // Skill distribution
    const skillDistribution = workers.reduce((acc, worker) => {
      (worker.specializations || []).forEach((skill: ProductionStage) => {
        acc[skill] = (acc[skill] || 0) + 1
      })
      return acc
    }, {} as Record<ProductionStage, number>)

    return {
      totalWorkers,
      activeWorkers,
      utilizationRate,
      topPerformers,
      productivityByStage,
      attendanceRate,
      skillDistribution,
    }
  }

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(
    startDate: Date,
    endDate: Date
  ): Promise<RevenueAnalytics> {
    // Get orders with revenue data
    const { data: orders } = await this.supabase
      .from('orders')
      .select(`
        *,
        model:headphone_models(name),
        customer:customers(name, email)
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (!orders) {
      return this.getEmptyRevenueAnalytics()
    }

    // Total revenue - price data not available in current schema
    const totalRevenue = 0 // Placeholder - would need price data

    // Revenue by model
    const revenueByModel = orders.reduce((acc, order) => {
      if (order.model) {
        const modelName = order.model.name
        acc[modelName] = (acc[modelName] || 0) + 0 // Price data not available
      }
      return acc
    }, {} as Record<string, number>)

    // Revenue by month
    const revenueByMonth = this.calculateRevenueByMonth(orders)

    // Average order value
    const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0

    // Projected revenue (simple linear projection)
    const daysInPeriod = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const dailyRevenue = totalRevenue / daysInPeriod
    const projectedRevenue = dailyRevenue * 30 // Project for 30 days

    // Top customers
    const customerRevenue = orders.reduce((acc, order) => {
      if (order.customer && order.customer.email) {
        const key = order.customer.email
        if (!acc[key]) {
          acc[key] = { name: order.customer.name || order.customer.email, orders: 0, revenue: 0 }
        }
        acc[key].orders += 1
        acc[key].revenue += 0 // Price data not available
      }
      return acc
    }, {} as Record<string, { name: string; orders: number; revenue: number }>)

    const topCustomers = Object.entries(customerRevenue)
      .map(([email, data]) => ({ customer: data.name || email, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    return {
      totalRevenue,
      revenueByModel,
      revenueByMonth,
      averageOrderValue,
      projectedRevenue,
      topCustomers,
    }
  }

  // Helper methods
  private async getDailyProduction(startDate: Date, endDate: Date) {
    const { data } = await this.supabase
      .from('orders')
      .select('created_at, updated_at, status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    const dailyMap = new Map<string, { started: number; completed: number }>()
    
    data?.forEach(order => {
      if (!order.created_at) return
      const date = format(new Date(order.created_at), 'yyyy-MM-dd')
      if (!dailyMap.has(date)) {
        dailyMap.set(date, { started: 0, completed: 0 })
      }
      const day = dailyMap.get(date)!
      day.started++
      
      if (order.status === 'completed' && order.updated_at) {
        const completedDate = format(new Date(order.updated_at), 'yyyy-MM-dd')
        if (!dailyMap.has(completedDate)) {
          dailyMap.set(completedDate, { started: 0, completed: 0 })
        }
        dailyMap.get(completedDate)!.completed++
      }
    })

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private calculatePassRateByStage(qualityChecks: any[]) {
    const stageData = qualityChecks.reduce((acc, check) => {
      const stage = check.stage
      if (!acc[stage]) {
        acc[stage] = { total: 0, passed: 0 }
      }
      acc[stage].total++
      if (check.overall_status === 'good') {
        acc[stage].passed++
      }
      return acc
    }, {} as Record<ProductionStage, { total: number; passed: number }>)

    return Object.entries(stageData).reduce((acc, [stage, data]) => {
      const stageMetrics = data as { total: number; passed: number }
      acc[stage as ProductionStage] = stageMetrics.total > 0 
        ? (stageMetrics.passed / stageMetrics.total) * 100 
        : 0
      return acc
    }, {} as Record<ProductionStage, number>)
  }

  private async getQualityTrend(startDate: Date, endDate: Date) {
    const { data } = await this.supabase
      .from('quality_checks')
      .select('created_at, overall_status')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at')

    const dailyData = new Map<string, { total: number; passed: number }>()
    
    data?.forEach(check => {
      if (!check.created_at) return
      const date = format(new Date(check.created_at), 'yyyy-MM-dd')
      if (!dailyData.has(date)) {
        dailyData.set(date, { total: 0, passed: 0 })
      }
      const day = dailyData.get(date)!
      day.total++
      if (check.overall_status === 'good') {
        day.passed++
      }
    })

    return Array.from(dailyData.entries())
      .map(([date, data]) => ({
        date,
        passRate: data.total > 0 ? (data.passed / data.total) * 100 : 0,
        checks: data.total,
      }))
      .slice(-7) // Last 7 days
  }

  private calculateWorkerQualityScores(qualityChecks: any[]) {
    const workerData = qualityChecks.reduce((acc, check) => {
      if (check.worker) {
        const name = check.worker.name
        if (!acc[name]) {
          acc[name] = { total: 0, passed: 0 }
        }
        acc[name].total++
        if (check.overall_status === 'good') {
          acc[name].passed++
        }
      }
      return acc
    }, {} as Record<string, { total: number; passed: number }>)

    return Object.entries(workerData)
      .map(([worker, data]) => {
        const metrics = data as { total: number; passed: number }
        return {
          worker,
          passRate: metrics.total > 0 ? (metrics.passed / metrics.total) * 100 : 0,
          checks: metrics.total,
        }
      })
      .sort((a, b) => b.passRate - a.passRate)
      .slice(0, 10)
  }

  private async getTopPerformers(workers: any[], metrics: any[]) {
    const workerMetrics = metrics.reduce((acc, metric) => {
      const workerId = metric.worker_id
      if (!acc[workerId]) {
        acc[workerId] = {
          units: 0,
          time: 0,
          quality: [],
        }
      }
      acc[workerId].units += metric.units_completed
      acc[workerId].time += metric.total_time_minutes || 0
      if (metric.quality_pass_rate !== null) {
        acc[workerId].quality.push(metric.quality_pass_rate)
      }
      return acc
    }, {} as Record<string, any>)

    return workers
      .map(worker => {
        const metrics = workerMetrics[worker.id]
        if (!metrics) return null

        const avgQuality = metrics.quality.length > 0
          ? metrics.quality.reduce((a: number, b: number) => a + b) / metrics.quality.length
          : 0
        const efficiency = metrics.time > 0 ? metrics.units / (metrics.time / 60) : 0
        const score = metrics.units * (avgQuality / 100) * efficiency

        return { worker, score, metrics: { ...metrics, avgQuality, efficiency } }
      })
      .filter(Boolean)
      .sort((a, b) => b!.score - a!.score)
      .slice(0, 5) as any[]
  }

  private calculateProductivityByStage(metrics: any[]) {
    const stageData = metrics.reduce((acc, metric) => {
      const stage = metric.stage
      if (!acc[stage]) {
        acc[stage] = { workers: new Set(), totalUnits: 0, totalTime: 0 }
      }
      acc[stage].workers.add(metric.worker_id)
      acc[stage].totalUnits += metric.units_completed
      acc[stage].totalTime += metric.total_time_minutes || 0
      return acc
    }, {} as Record<ProductionStage, any>)

    return Object.entries(stageData).reduce((acc, [stage, data]) => {
      const stageMetrics = data as { workers: Set<string>; totalUnits: number; totalTime: number }
      const workers = stageMetrics.workers.size
      const avgOutput = workers > 0 ? stageMetrics.totalUnits / workers : 0
      acc[stage as ProductionStage] = { workers, avgOutput }
      return acc
    }, {} as Record<ProductionStage, { workers: number; avgOutput: number }>)
  }

  private calculateRevenueByMonth(orders: any[]) {
    const monthlyData = orders.reduce((acc, order) => {
      if (!order.created_at) return acc
      const month = format(new Date(order.created_at), 'yyyy-MM')
      if (!acc[month]) {
        acc[month] = { revenue: 0, orders: 0 }
      }
      acc[month].revenue += 0 // Price data not available
      acc[month].orders += 1
      return acc
    }, {} as Record<string, { revenue: number; orders: number }>)

    return Object.entries(monthlyData)
      .map(([month, data]) => {
        const monthData = data as { revenue: number; orders: number }
        return { 
          month, 
          revenue: monthData.revenue,
          orders: monthData.orders 
        }
      })
      .sort((a, b) => a.month.localeCompare(b.month))
  }

  // Empty data helpers
  private getEmptyProductionAnalytics(): ProductionAnalytics {
    return {
      totalOrders: 0,
      completedOrders: 0,
      inProgressOrders: 0,
      averageCompletionTime: 0,
      onTimeDeliveryRate: 100,
      ordersByStage: {} as Record<ProductionStage, number>,
      ordersByPriority: {},
      dailyProduction: [],
      topModels: [],
    }
  }

  private getEmptyQualityAnalytics(): QualityAnalytics {
    return {
      overallPassRate: 100,
      passRateByStage: {} as Record<ProductionStage, number>,
      commonIssues: [],
      qualityTrend: [],
      workerQualityScores: [],
      criticalIssues: 0,
      resolvedIssues: 0,
      avgResolutionTime: 0,
    }
  }

  private getEmptyWorkerAnalytics(): WorkerAnalytics {
    return {
      totalWorkers: 0,
      activeWorkers: 0,
      utilizationRate: 0,
      topPerformers: [],
      productivityByStage: {} as Record<ProductionStage, { workers: number; avgOutput: number }>,
      attendanceRate: 100,
      skillDistribution: {} as Record<ProductionStage, number>,
    }
  }

  private getEmptyRevenueAnalytics(): RevenueAnalytics {
    return {
      totalRevenue: 0,
      revenueByModel: {},
      revenueByMonth: [],
      averageOrderValue: 0,
      projectedRevenue: 0,
      topCustomers: [],
    }
  }
}