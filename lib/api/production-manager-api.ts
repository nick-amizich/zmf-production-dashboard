import { 
  ManagerDashboardMetrics,
  ProductionStageData
} from '@/lib/services/production-manager-service'

export class ProductionManagerAPI {
  static async getDashboardMetrics(): Promise<ManagerDashboardMetrics> {
    const response = await fetch('/api/production/manager/metrics')
    if (!response.ok) throw new Error('Failed to fetch manager metrics')
    return response.json()
  }

  static async getProductionStages(): Promise<ProductionStageData[]> {
    const response = await fetch('/api/production/manager/stages')
    if (!response.ok) throw new Error('Failed to fetch production stages')
    return response.json()
  }

  static async getRecentAlerts(): Promise<any[]> {
    const response = await fetch('/api/production/manager/alerts')
    if (!response.ok) throw new Error('Failed to fetch recent alerts')
    return response.json()
  }
}