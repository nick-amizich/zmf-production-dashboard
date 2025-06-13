'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface QualityMetricsProps {
  data: {
    overallPassRate: number
    passRateByStage: Record<string, number>
    commonIssues: Array<{ category: string; count: number; percentage: number }>
    qualityTrend: Array<{ date: string; passRate: number; checks: number }>
    workerQualityScores: Array<{ worker: string; passRate: number; checks: number }>
    criticalIssues: number
    resolvedIssues: number
    avgResolutionTime: number
  }
  compact?: boolean
}

const STAGE_COLORS = {
  'Intake': '#8b5cf6',
  'Sanding': '#ec4899',
  'Finishing': '#f59e0b',
  'Sub-Assembly': '#10b981',
  'Final Assembly': '#3b82f6',
  'Acoustic QC': '#6366f1',
  'Shipping': '#84cc16'
}

export function QualityMetrics({ data, compact = false }: QualityMetricsProps) {
  const stageQualityData = Object.entries(data.passRateByStage).map(([stage, rate]) => ({
    stage,
    passRate: rate
  }))

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quality Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Pass Rate</p>
                <p className="text-2xl font-bold text-theme-status-success">
                  {data.overallPassRate.toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold text-theme-status-error">{data.criticalIssues}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{data.resolvedIssues}</p>
              </div>
            </div>
            
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.qualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="passRate" 
                    stroke="#10b981" 
                    name="Pass Rate %" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overall Pass Rate</p>
                <p className="text-3xl font-bold">{data.overallPassRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-theme-status-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-3xl font-bold text-theme-status-error">{data.criticalIssues}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-theme-status-error" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resolved Issues</p>
                <p className="text-3xl font-bold">{data.resolvedIssues}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-theme-status-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-3xl font-bold">{data.avgResolutionTime.toFixed(1)}h</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quality Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Quality Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.qualityTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="passRate" 
                    stroke="#10b981" 
                    name="Pass Rate %" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="checks" 
                    stroke="#3b82f6" 
                    name="Total Checks" 
                    strokeWidth={2}
                    yAxisId="right"
                  />
                  <YAxis yAxisId="right" orientation="right" stroke="#888" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pass Rate by Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Pass Rate by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stageQualityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="stage" stroke="#888" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="passRate" name="Pass Rate %">
                    {stageQualityData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STAGE_COLORS[entry.stage as keyof typeof STAGE_COLORS] || '#666'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Common Issues */}
        <Card>
          <CardHeader>
            <CardTitle>Common Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.commonIssues.map((issue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{index + 1}</Badge>
                    <span className="font-medium">{issue.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {issue.count} ({issue.percentage.toFixed(1)}%)
                    </span>
                    <div className="w-20 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-theme-status-error" 
                        style={{ width: `${issue.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Worker Quality Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Top Quality Performers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.workerQualityScores.slice(0, 5).map((worker, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={index < 3 ? 'default' : 'outline'}>{index + 1}</Badge>
                    <span className="font-medium">{worker.worker}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {worker.checks} checks
                    </span>
                    <Badge variant={worker.passRate >= 95 ? 'success' : 'secondary'}>
                      {worker.passRate.toFixed(1)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}