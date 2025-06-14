"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MetricsCard } from "@/components/metrics-card"
import { WorkerStatusCard } from "@/components/worker-status-card"
import { OrderCard } from "@/components/order-card"
import { QualityChart } from "@/components/quality-chart"
import { Headphones, AlertTriangle, CheckCircle, Users, Search, Filter, Plus, Settings, Loader2 } from "lucide-react"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { ProductionDashboardAPI } from '@/lib/api/production-dashboard-api'
import { 
  type WorkerStatus, 
  type OrderStatus, 
  type ProductionMetrics,
  type QualityIssue,
  type StageBottleneck
} from '@/lib/services/production-dashboard-service'
import { logger } from '@/lib/logger'
import { useRouter } from 'next/navigation'
import { useMultiRealtime } from '@/hooks/use-realtime'

export default function ProductionDashboard() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [workers, setWorkers] = useState<WorkerStatus[]>([])
  const [orders, setOrders] = useState<OrderStatus[]>([])
  const [metrics, setMetrics] = useState<ProductionMetrics>({
    activeBuilds: 0,
    atRiskOrders: 0,
    completedThisWeek: 0,
    staffUtilization: 0,
    activeBuildsTrend: 0,
    atRiskTrend: 0,
    completedTrend: 0
  })
  const [qualityIssues, setQualityIssues] = useState<QualityIssue[]>([])
  const [bottlenecks, setBottlenecks] = useState<StageBottleneck[]>([])

  useEffect(() => {
    loadDashboardData()
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Subscribe to real-time updates
  useMultiRealtime({
    subscriptions: [
      { table: 'batches' },
      { table: 'orders' },
      { table: 'stage_assignments' },
      { table: 'employees' },
      { table: 'issues' },
      { table: 'quality_checks' }
    ],
    onChange: (table, payload) => {
      logger.debug(`Real-time update from ${table}`, payload)
      
      // For most changes, we'll just reload the data
      // In a production app, you might want to update specific items
      switch (table) {
        case 'batches':
        case 'orders':
          // Reload orders when batches or orders change
          ProductionDashboardAPI.getOrderStatuses()
            .then(setOrders)
            .catch(error => logger.error('Failed to reload orders', error))
          
          // Also update metrics
          ProductionDashboardAPI.getProductionMetrics()
            .then(setMetrics)
            .catch(error => logger.error('Failed to reload metrics', error))
          break
          
        case 'stage_assignments':
        case 'employees':
          // Reload workers when assignments or employee status changes
          ProductionDashboardAPI.getWorkerStatuses()
            .then(setWorkers)
            .catch(error => logger.error('Failed to reload workers', error))
          break
          
        case 'issues':
          // Reload quality issues
          ProductionDashboardAPI.getQualityIssues()
            .then(setQualityIssues)
            .catch(error => logger.error('Failed to reload quality issues', error))
          break
          
        case 'quality_checks':
          // Reload bottlenecks which might be affected by quality checks
          ProductionDashboardAPI.getStageBottlenecks()
            .then(setBottlenecks)
            .catch(error => logger.error('Failed to reload bottlenecks', error))
          break
      }
    }
  })

  const loadDashboardData = async () => {
    try {
      logger.debug("Loading production dashboard data")
      
      // Load all data in parallel
      const [workersData, ordersData, metricsData, issuesData, bottlenecksData] = await Promise.all([
        ProductionDashboardAPI.getWorkerStatuses(),
        ProductionDashboardAPI.getOrderStatuses(),
        ProductionDashboardAPI.getProductionMetrics(),
        ProductionDashboardAPI.getQualityIssues(),
        ProductionDashboardAPI.getStageBottlenecks()
      ])

      setWorkers(workersData)
      setOrders(ordersData)
      setMetrics(metricsData)
      setQualityIssues(issuesData)
      setBottlenecks(bottlenecksData)
      setIsLoading(false)
    } catch (error) {
      logger.error('Failed to load dashboard data', error)
      setIsLoading(false)
    }
  }

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.model.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary flex items-center justify-center">
        <div className="text-theme-text-secondary text-xl">Loading Production Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Header */}
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Headphones className="h-8 w-8 text-theme-text-secondary" />
            <div>
              <h1 className="text-2xl font-bold text-theme-text-secondary">ZMF Production Control</h1>
              <p className="text-sm text-theme-text-tertiary">Premium Headphone Manufacturing</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeSwitcher />
            <Button 
              variant="outline" 
              size="sm" 
              className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20"
              onClick={() => {
                alert("Settings page coming soon!")
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Metrics Bar */}
      <div className="px-6 py-4 border-b border-theme-border-primary">
        <div className="grid grid-cols-4 gap-4">
          <MetricsCard
            title="Active Builds"
            value={metrics.activeBuilds}
            subtitle="In production"
            icon={Headphones}
            trend={metrics.activeBuildsTrend > 0 ? "up" : metrics.activeBuildsTrend < 0 ? "down" : "neutral"}
            trendValue={`${metrics.activeBuildsTrend > 0 ? '+' : ''}${metrics.activeBuildsTrend} from yesterday`}
          />
          <MetricsCard
            title="At-Risk Orders"
            value={metrics.atRiskOrders}
            subtitle="Behind schedule"
            icon={AlertTriangle}
            trend={metrics.atRiskTrend > 0 ? "up" : metrics.atRiskTrend < 0 ? "down" : "neutral"}
            trendValue={`${metrics.atRiskTrend > 0 ? '+' : ''}${metrics.atRiskTrend} from yesterday`}
          />
          <MetricsCard
            title="Completed This Week"
            value={metrics.completedThisWeek}
            subtitle="Shipped orders"
            icon={CheckCircle}
            trend={metrics.completedTrend > 0 ? "up" : metrics.completedTrend < 0 ? "down" : "neutral"}
            trendValue={`${metrics.completedTrend > 0 ? '+' : ''}${metrics.completedTrend}% vs last week`}
          />
          <MetricsCard
            title="Staff Utilization"
            value={`${metrics.staffUtilization}%`}
            subtitle="Average across all workers"
            icon={Users}
            trend="neutral"
            trendValue={metrics.staffUtilization > 80 ? "Optimal" : "Below target"}
          />
        </div>
      </div>

      <div className="flex h-[calc(100vh-200px)]">
        {/* Left Sidebar - Workers */}
        <div className="w-80 border-r border-theme-border-primary bg-theme-bg-secondary/30 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-theme-text-secondary">Worker Status</h2>
            <Badge variant="outline" className="border-theme-border-active text-theme-text-secondary">
              {workers.filter((w) => w.status === "available").length} Available
            </Badge>
          </div>
          <div className="space-y-3 overflow-y-auto">
            {workers.map((worker) => (
              <WorkerStatusCard key={worker.id} worker={worker} />
            ))}
          </div>
        </div>

        {/* Center - Order Queue */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-theme-text-secondary">Production Queue</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-text-tertiary" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary placeholder-theme-text-tertiary"
                />
              </div>
              <Button variant="outline" size="sm" className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button 
                size="sm" 
                className="bg-theme-brand-secondary hover:bg-theme-brand-hover text-theme-text-primary"
                onClick={() => router.push('/orders/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Order
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 overflow-y-auto">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>

        {/* Right Panel - Quality Metrics */}
        <div className="w-80 border-l border-theme-border-primary bg-theme-bg-secondary/30 p-4">
          <h2 className="text-lg font-semibold text-theme-text-secondary mb-4">Quality Dashboard</h2>

          <div className="space-y-4">
            <QualityChart />

            <Card className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-sm">Recent Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {qualityIssues.length > 0 ? (
                  qualityIssues.map((issue) => (
                    <div key={issue.id} className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${
                        issue.severity === 'error' ? 'bg-theme-status-error' :
                        issue.severity === 'warning' ? 'bg-theme-status-warning' :
                        'bg-theme-status-success'
                      }`} />
                      <span className="text-theme-text-tertiary">
                        {issue.description} - {issue.orderId}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-theme-text-tertiary">
                    No recent issues reported
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-sm">Stage Bottlenecks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {bottlenecks.length > 0 ? (
                  bottlenecks.slice(0, 3).map((bottleneck) => (
                    <div key={bottleneck.stage} className="flex justify-between text-sm">
                      <span className="text-theme-text-tertiary">{bottleneck.stage}</span>
                      <Badge variant="outline" className={`
                        ${bottleneck.status === 'critical' ? 'border-theme-status-error text-theme-status-error' :
                          bottleneck.status === 'warning' ? 'border-theme-status-warning text-theme-status-warning' :
                          'border-theme-status-success text-theme-status-success'}
                      `}>
                        {bottleneck.averageTime.toFixed(1)}h avg
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-theme-text-tertiary">
                    No bottlenecks detected
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
