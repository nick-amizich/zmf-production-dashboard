'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { format } from 'date-fns'

interface WorkerStatsProps {
  performance: {
    totalUnitsCompleted: number
    averageTimePerUnit: number
    qualityPassRate: number
    currentStreak: number
    bestStreak: number
    stageMetrics: Array<{
      stage: string
      unitsCompleted: number
      averageTime: number
      qualityRate: number
      lastCompleted: Date | null
    }>
    recentMetrics: Array<{
      date: string
      units_completed: number
      quality_pass_rate: number | null
      total_time_minutes: number | null
    }>
  }
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

export function WorkerStats({ performance }: WorkerStatsProps) {
  // Prepare data for recent performance chart
  const recentData = performance.recentMetrics
    .slice(0, 7)
    .reverse()
    .map(metric => ({
      date: format(new Date(metric.date), 'MMM d'),
      units: metric.units_completed,
      quality: metric.quality_pass_rate || 0,
    }))

  // Prepare data for stage distribution
  const stageData = performance.stageMetrics
    .filter(m => m.unitsCompleted > 0)
    .map(metric => ({
      name: metric.stage,
      value: metric.unitsCompleted,
      quality: metric.qualityRate,
    }))

  return (
    <div className="space-y-6">
      {/* Recent Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="date" stroke="#888" />
                <YAxis yAxisId="left" stroke="#888" />
                <YAxis yAxisId="right" orientation="right" stroke="#888" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="units" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Units Completed"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="quality" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Quality Rate %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Stage Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Units by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stageData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={STAGE_COLORS[entry.name as keyof typeof STAGE_COLORS] || '#666'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stage Expertise</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performance.stageMetrics
                .filter(m => m.unitsCompleted > 0)
                .sort((a, b) => b.qualityRate - a.qualityRate)
                .map((metric) => (
                  <div key={metric.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: STAGE_COLORS[metric.stage as keyof typeof STAGE_COLORS] || '#666' }}
                        />
                        <span className="font-medium">{metric.stage}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {metric.unitsCompleted} units
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {metric.qualityRate.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={metric.qualityRate} className="h-2" />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Efficiency Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Efficiency Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-zinc-900 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Avg Time per Unit</p>
              <p className="text-2xl font-bold">
                {performance.averageTimePerUnit.toFixed(1)} min
              </p>
            </div>
            <div className="text-center p-4 bg-zinc-900 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Daily Average</p>
              <p className="text-2xl font-bold">
                {(performance.totalUnitsCompleted / Math.max(performance.recentMetrics.length, 1)).toFixed(1)} units
              </p>
            </div>
            <div className="text-center p-4 bg-zinc-900 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Quality Score</p>
              <p className="text-2xl font-bold">
                {(performance.qualityPassRate * performance.totalUnitsCompleted / 100).toFixed(0)} pts
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}