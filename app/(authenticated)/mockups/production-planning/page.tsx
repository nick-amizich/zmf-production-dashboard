'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  Clock, 
  AlertTriangle,
  BarChart3,
  Calendar,
  Target,
  Gauge,
  Activity,
  ChevronRight,
  Zap
} from 'lucide-react'

// Mock data for production metrics
const mockCapacityData = {
  overall: 78,
  stages: [
    { name: 'Intake', capacity: 95, workers: 3, builds: 12 },
    { name: 'Sanding', capacity: 82, workers: 4, builds: 18 },
    { name: 'Finishing', capacity: 68, workers: 3, builds: 15 },
    { name: 'Sub-Assembly', capacity: 45, workers: 2, builds: 8 },
    { name: 'Final Assembly', capacity: 88, workers: 5, builds: 22 },
    { name: 'Acoustic QC', capacity: 72, workers: 2, builds: 9 },
    { name: 'Shipping', capacity: 90, workers: 2, builds: 11 }
  ]
}

const mockProductionMetrics = {
  dailyTarget: 12,
  dailyActual: 10,
  weeklyTarget: 60,
  weeklyActual: 48,
  monthlyTarget: 240,
  monthlyActual: 198,
  avgCycleTime: 6.2,
  throughput: 83,
  efficiency: 87,
  qualityRate: 96.5
}

const mockBottlenecks = [
  {
    stage: 'Sub-Assembly',
    severity: 'high',
    impact: 'Limiting factor for 8 builds',
    suggestion: 'Add 1 worker or extend hours',
    potentialGain: '+25% capacity'
  },
  {
    stage: 'Finishing',
    severity: 'medium',
    impact: 'Delaying 5 builds',
    suggestion: 'Optimize drying process',
    potentialGain: '+15% throughput'
  }
]

const mockForecast = [
  { week: 'Week 1', planned: 60, projected: 58, capacity: 65 },
  { week: 'Week 2', planned: 65, projected: 62, capacity: 65 },
  { week: 'Week 3', planned: 70, projected: 64, capacity: 65 },
  { week: 'Week 4', planned: 75, projected: 65, capacity: 65 }
]

const mockWIPLimits = [
  { stage: 'Sanding', current: 18, limit: 20, percentage: 90 },
  { stage: 'Finishing', current: 15, limit: 15, percentage: 100 },
  { stage: 'Final Assembly', current: 22, limit: 25, percentage: 88 },
  { stage: 'Sub-Assembly', current: 8, limit: 10, percentage: 80 }
]

export default function ProductionPlanningMockup() {
  const [selectedPeriod, setSelectedPeriod] = useState('week')
  const [selectedMetric, setSelectedMetric] = useState('capacity')

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return 'text-theme-status-error'
    if (percentage >= 75) return 'text-theme-status-warning'
    return 'text-theme-status-success'
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-theme-status-error'
    if (percentage >= 75) return 'bg-theme-status-warning'
    return 'bg-theme-status-success'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-primary">Production Planning</h1>
            <p className="text-theme-text-tertiary mt-1">Capacity planning and performance optimization</p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[150px] bg-theme-bg-secondary border-theme-border-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-theme-brand-primary hover:bg-theme-brand-primary/90">
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary flex items-center justify-between">
                Production Rate
                <Badge className="bg-theme-status-info text-white text-xs">Live</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-theme-text-primary">
                    {mockProductionMetrics.dailyActual}/{mockProductionMetrics.dailyTarget}
                  </div>
                  <p className="text-xs text-theme-text-tertiary">Units today</p>
                </div>
                <div className="flex items-center text-theme-status-warning">
                  <TrendingDown className="w-4 h-4 mr-1" />
                  <span className="text-sm">-17%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Avg Cycle Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-theme-text-primary">{mockProductionMetrics.avgCycleTime}</div>
                  <p className="text-xs text-theme-text-tertiary">Days per unit</p>
                </div>
                <div className="flex items-center text-theme-status-success">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm">+8%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Efficiency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-theme-text-primary">{mockProductionMetrics.efficiency}%</div>
                  <p className="text-xs text-theme-text-tertiary">Overall efficiency</p>
                </div>
                <Gauge className="w-8 h-8 text-theme-brand-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-theme-text-tertiary">Quality Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-2xl font-bold text-theme-text-primary">{mockProductionMetrics.qualityRate}%</div>
                  <p className="text-xs text-theme-text-tertiary">First pass yield</p>
                </div>
                <Activity className="w-8 h-8 text-theme-status-success" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Capacity Overview */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-theme-text-primary">Stage Capacity</CardTitle>
                <CardDescription className="text-theme-text-tertiary">
                  Real-time capacity utilization by production stage
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-theme-text-primary">{mockCapacityData.overall}%</div>
                <p className="text-xs text-theme-text-tertiary">Overall utilization</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCapacityData.stages.map((stage) => (
              <div key={stage.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-theme-text-primary w-24">{stage.name}</span>
                    <div className="flex items-center gap-2 text-sm text-theme-text-tertiary">
                      <Users className="w-4 h-4" />
                      <span>{stage.workers} workers</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-theme-text-tertiary">
                      <Package className="w-4 h-4" />
                      <span>{stage.builds} builds</span>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${getCapacityColor(stage.capacity)}`}>
                    {stage.capacity}%
                  </span>
                </div>
                <Progress value={stage.capacity} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bottleneck Analysis */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader>
              <CardTitle className="text-theme-text-primary flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-theme-status-warning" />
                Bottleneck Analysis
              </CardTitle>
              <CardDescription className="text-theme-text-tertiary">
                Production constraints and optimization opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockBottlenecks.map((bottleneck, index) => (
                <div key={index} className="p-4 bg-theme-bg-primary rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-theme-text-primary">{bottleneck.stage}</h4>
                    <Badge className={bottleneck.severity === 'high' ? 'bg-theme-status-error text-white' : 'bg-theme-status-warning text-white'}>
                      {bottleneck.severity} impact
                    </Badge>
                  </div>
                  <p className="text-sm text-theme-text-tertiary">{bottleneck.impact}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-theme-border-secondary">
                    <p className="text-sm text-theme-text-primary">{bottleneck.suggestion}</p>
                    <span className="text-sm font-medium text-theme-status-success">{bottleneck.potentialGain}</span>
                  </div>
                </div>
              ))}
              <Button variant="outline" className="w-full border-theme-border-secondary">
                <Zap className="w-4 h-4 mr-2" />
                Run Optimization Analysis
              </Button>
            </CardContent>
          </Card>

          {/* WIP Limits */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader>
              <CardTitle className="text-theme-text-primary">Work In Progress Limits</CardTitle>
              <CardDescription className="text-theme-text-tertiary">
                Prevent overload and maintain flow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockWIPLimits.map((wip) => (
                <div key={wip.stage} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-theme-text-primary">{wip.stage}</span>
                    <span className="text-sm text-theme-text-tertiary">
                      {wip.current} / {wip.limit} builds
                    </span>
                  </div>
                  <div className="relative">
                    <Progress value={wip.percentage} className="h-3" />
                    {wip.percentage >= 100 && (
                      <div className="absolute -top-1 -right-1">
                        <div className="w-2 h-2 bg-theme-status-error rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-theme-border-secondary">
                <p className="text-sm text-theme-text-tertiary">
                  WIP limits help maintain steady flow and prevent bottlenecks
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Production Forecast */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">4-Week Production Forecast</CardTitle>
            <CardDescription className="text-theme-text-tertiary">
              Planned vs projected output based on current performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockForecast.map((week) => (
                <div key={week.week} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-theme-text-primary">{week.week}</span>
                    <div className="flex items-center gap-6">
                      <span className="text-theme-text-tertiary">Planned: {week.planned}</span>
                      <span className="text-theme-brand-primary">Projected: {week.projected}</span>
                      <span className="text-theme-text-secondary">Capacity: {week.capacity}</span>
                    </div>
                  </div>
                  <div className="relative h-6 bg-theme-bg-primary rounded-lg overflow-hidden">
                    <div 
                      className="absolute top-0 left-0 h-full bg-theme-text-tertiary/20"
                      style={{ width: `${(week.planned / 100) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 left-0 h-full bg-theme-brand-primary"
                      style={{ width: `${(week.projected / 100) * 100}%` }}
                    />
                    <div 
                      className="absolute top-0 h-full w-0.5 bg-theme-status-error"
                      style={{ left: `${(week.capacity / 100) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-theme-border-secondary">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-theme-text-tertiary/20 rounded" />
                    <span className="text-theme-text-tertiary">Planned</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-theme-brand-primary rounded" />
                    <span className="text-theme-text-tertiary">Projected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-0.5 h-3 bg-theme-status-error" />
                    <span className="text-theme-text-tertiary">Max Capacity</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="border-theme-border-secondary">
                  <Calendar className="w-4 h-4 mr-2" />
                  Adjust Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">Planning Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="border-theme-border-secondary justify-start">
                <Target className="w-4 h-4 mr-2" />
                Set Targets
              </Button>
              <Button variant="outline" className="border-theme-border-secondary justify-start">
                <Users className="w-4 h-4 mr-2" />
                Resource Planning
              </Button>
              <Button variant="outline" className="border-theme-border-secondary justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Simulation
              </Button>
              <Button variant="outline" className="border-theme-border-secondary justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}