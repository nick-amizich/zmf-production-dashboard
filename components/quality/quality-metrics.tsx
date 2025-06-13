'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle } from 'lucide-react'

interface QualityMetricsProps {
  metrics: {
    totalChecks: number
    passRate: number
    byStage: Record<string, { total: number; passed: number; passRate: number }>
    byWorker: Record<string, { total: number; passed: number; passRate: number }>
  }
}

export function QualityMetrics({ metrics }: QualityMetricsProps) {
  const trend = metrics.passRate >= 95 ? 'up' : 'down'
  const TrendIcon = trend === 'up' ? TrendingUp : TrendingDown
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Checks
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalChecks}</div>
          <p className="text-xs text-muted-foreground">
            Quality checks performed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Pass Rate
          </CardTitle>
          <TrendIcon className={`h-4 w-4 ${trend === 'up' ? 'text-theme-status-success' : 'text-theme-status-error'}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.passRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Overall quality score
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Critical Issues
          </CardTitle>
          <AlertCircle className="h-4 w-4 text-theme-status-error" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {metrics.totalChecks - Math.round(metrics.totalChecks * metrics.passRate / 100)}
          </div>
          <p className="text-xs text-muted-foreground">
            Requiring attention
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Stages Monitored
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{Object.keys(metrics.byStage).length}</div>
          <p className="text-xs text-muted-foreground">
            Production stages
          </p>
        </CardContent>
      </Card>
    </>
  )
}