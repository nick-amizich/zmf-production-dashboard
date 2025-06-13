'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { Trophy, Users, TrendingUp } from 'lucide-react'

interface WorkerPerformanceProps {
  data: {
    totalWorkers: number
    activeWorkers: number
    utilizationRate: number
    topPerformers: Array<{ worker: any; score: number; metrics: any }>
    productivityByStage: Record<string, { workers: number; avgOutput: number }>
    attendanceRate: number
    skillDistribution: Record<string, number>
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

export function WorkerPerformance({ data, compact = false }: WorkerPerformanceProps) {
  const productivityData = Object.entries(data.productivityByStage).map(([stage, info]) => ({
    stage,
    ...info
  }))

  const skillData = Object.entries(data.skillDistribution).map(([skill, count]) => ({
    name: skill,
    value: count
  }))

  if (compact) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Worker Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Utilization</p>
                <p className="text-2xl font-bold">{data.utilizationRate.toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{data.activeWorkers}/{data.totalWorkers}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Attendance</p>
                <p className="text-2xl font-bold">{data.attendanceRate.toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Top Performers</p>
              {data.topPerformers.slice(0, 3).map((performer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={index === 0 ? 'default' : 'outline'}>{index + 1}</Badge>
                    <span className="text-sm">{performer.worker.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {performer.metrics.units} units
                  </span>
                </div>
              ))}
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
                <p className="text-sm text-muted-foreground">Total Workers</p>
                <p className="text-3xl font-bold">{data.totalWorkers}</p>
              </div>
              <Users className="h-8 w-8 text-theme-status-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Workers</p>
                <p className="text-3xl font-bold">{data.activeWorkers}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-theme-status-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Utilization Rate</p>
                <p className="text-3xl font-bold">{data.utilizationRate.toFixed(1)}%</p>
              </div>
              <Progress value={data.utilizationRate} className="w-16" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Attendance Rate</p>
                <p className="text-3xl font-bold">{data.attendanceRate.toFixed(1)}%</p>
              </div>
              <Progress value={data.attendanceRate} className="w-16" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPerformers.map((performer, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={index === 0 ? 'default' : 'outline'}>
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{performer.worker.name}</p>
                        <p className="text-sm text-muted-foreground">{performer.worker.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{performer.score.toFixed(0)} pts</p>
                      <p className="text-sm text-muted-foreground">
                        {performer.metrics.units} units
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-zinc-900 rounded">
                      <p className="text-muted-foreground">Quality</p>
                      <p className="font-medium">{performer.metrics.avgQuality.toFixed(1)}%</p>
                    </div>
                    <div className="text-center p-2 bg-zinc-900 rounded">
                      <p className="text-muted-foreground">Efficiency</p>
                      <p className="font-medium">{performer.metrics.efficiency.toFixed(1)}/hr</p>
                    </div>
                    <div className="text-center p-2 bg-zinc-900 rounded">
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium">{(performer.metrics.time / 60).toFixed(1)}h</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productivity by Stage */}
        <Card>
          <CardHeader>
            <CardTitle>Productivity by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="stage" stroke="#888" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#888" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="avgOutput" name="Avg Output/Worker">
                    {productivityData.map((entry, index) => (
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

        {/* Skill Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Skill Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={skillData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {skillData.map((entry, index) => (
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

        {/* Worker Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Workers per Stage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productivityData.map((stage, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{stage.stage}</span>
                    <Badge variant="outline">{stage.workers} workers</Badge>
                  </div>
                  <Progress 
                    value={(stage.workers / data.totalWorkers) * 100} 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}