'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  Calendar,
  Bell,
  BarChart3
} from 'lucide-react'
import { WorkerStats } from './worker-stats'
import { WorkerAssignments } from './worker-assignments'
import { WorkerSchedule } from './worker-schedule'
import { WorkerNotifications } from './worker-notifications'
import { formatDistanceToNow } from 'date-fns'

interface WorkerDashboardProps {
  data: {
    worker: any
    performance: any
    activeAssignments: any[]
    schedule: any[]
    notifications: any[]
  }
}

export function WorkerDashboard({ data }: WorkerDashboardProps) {
  const { worker, performance, activeAssignments, schedule, notifications } = data
  const [activeTab, setActiveTab] = useState('overview')

  const unreadNotifications = notifications.filter(n => !n.is_read).length

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-primary">
              Welcome back, {worker.name}!
            </h1>
            <p className="text-zinc-400 mt-1">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-3 py-1">
              {worker.role.replace('_', ' ').toUpperCase()}
            </Badge>
            {performance.rank > 0 && (
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="text-theme-text-primary font-medium">
                  Rank #{performance.rank} of {performance.totalWorkers}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Quick Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Units Completed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.totalUnitsCompleted}</div>
              <p className="text-xs text-muted-foreground">
                Total all time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quality Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-theme-status-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {performance.qualityPassRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Average pass rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Tasks
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeAssignments.length}</div>
              <p className="text-xs text-muted-foreground">
                Currently assigned
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Streak
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performance.currentStreak} days</div>
              <p className="text-xs text-muted-foreground">
                Best: {performance.bestStreak} days
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assignments">
              My Tasks
              {activeAssignments.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeAssignments.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {unreadNotifications > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <WorkerStats performance={performance} />
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <WorkerAssignments 
              assignments={activeAssignments}
              workerId={worker.id}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <WorkerSchedule 
              schedule={schedule}
              workerId={worker.id}
            />
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <WorkerNotifications 
              notifications={notifications}
              workerId={worker.id}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}