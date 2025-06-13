'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Package,
  CheckCircle,
  AlertCircle,
  Download
} from 'lucide-react'
import { ProductionMetrics } from './production-metrics'
import { QualityMetrics } from './quality-metrics'
import { WorkerPerformance } from './worker-performance'
import { RevenueAnalysis } from './revenue-analysis'
import { format } from 'date-fns'

interface AnalyticsDashboardProps {
  data: {
    production: any
    quality: any
    worker: any
    revenue: any
    period: {
      start: Date
      end: Date
    }
  }
  initialPeriod: string
}

export function AnalyticsDashboard({ data, initialPeriod }: AnalyticsDashboardProps) {
  const [period, setPeriod] = useState(initialPeriod)
  const [activeTab, setActiveTab] = useState('overview')

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod)
    // Reload page with new period
    window.location.href = `/analytics?period=${newPeriod}`
  }

  const exportData = () => {
    // Convert data to CSV or JSON
    const exportData = {
      period: {
        start: format(data.period.start, 'yyyy-MM-dd'),
        end: format(data.period.end, 'yyyy-MM-dd'),
      },
      production: data.production,
      quality: data.quality,
      worker: data.worker,
      revenue: data.revenue,
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
  }

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-primary">Analytics Dashboard</h1>
            <p className="text-zinc-400 mt-1">
              {format(data.period.start, 'MMM d')} - {format(data.period.end, 'MMM d, yyyy')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={period} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="365">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Key Metrics */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${data.revenue.totalRevenue.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Avg order: ${data.revenue.averageOrderValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Orders Completed
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.production.completedOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                {data.production.onTimeDeliveryRate.toFixed(1)}% on-time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quality Pass Rate
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-theme-status-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.quality.overallPassRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {data.quality.criticalIssues} critical issues
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Worker Utilization
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {data.worker.utilizationRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                {data.worker.activeWorkers} of {data.worker.totalWorkers} active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="production">Production</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductionMetrics data={data.production} compact />
              <QualityMetrics data={data.quality} compact />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WorkerPerformance data={data.worker} compact />
              <RevenueAnalysis data={data.revenue} compact />
            </div>
          </TabsContent>

          <TabsContent value="production" className="space-y-6">
            <ProductionMetrics data={data.production} />
          </TabsContent>

          <TabsContent value="quality" className="space-y-6">
            <QualityMetrics data={data.quality} />
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            <WorkerPerformance data={data.worker} />
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <RevenueAnalysis data={data.revenue} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}