import { 
  WorkerStatus, 
  OrderStatus, 
  ProductionMetrics, 
  QualityIssue, 
  StageBottleneck 
} from '@/lib/services/production-dashboard-service'

export class ProductionDashboardAPI {
  static async getWorkerStatuses(): Promise<WorkerStatus[]> {
    const response = await fetch('/api/production/workers')
    if (!response.ok) throw new Error('Failed to fetch worker statuses')
    return response.json()
  }

  static async getOrderStatuses(): Promise<OrderStatus[]> {
    const response = await fetch('/api/production/orders')
    if (!response.ok) throw new Error('Failed to fetch order statuses')
    return response.json()
  }

  static async getProductionMetrics(): Promise<ProductionMetrics> {
    const response = await fetch('/api/production/metrics')
    if (!response.ok) throw new Error('Failed to fetch production metrics')
    return response.json()
  }

  static async getQualityIssues(): Promise<QualityIssue[]> {
    const response = await fetch('/api/production/quality-issues')
    if (!response.ok) throw new Error('Failed to fetch quality issues')
    return response.json()
  }

  static async getStageBottlenecks(): Promise<StageBottleneck[]> {
    const response = await fetch('/api/production/bottlenecks')
    if (!response.ok) throw new Error('Failed to fetch stage bottlenecks')
    return response.json()
  }
}