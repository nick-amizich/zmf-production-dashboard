'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Users, 
  Trophy, 
  Calendar, 
  TrendingUp,
  Search,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react'
import { WorkerLeaderboard } from './worker-leaderboard'
import { WorkerAvailabilityGrid } from './worker-availability-grid'
import { WorkerPerformanceChart } from './worker-performance-chart'
import { WorkerDetailModal } from './worker-detail-modal'

interface WorkerManagementDashboardProps {
  workers: any[]
  pendingWorkers?: any[]
  leaderboard: any[]
  availability: any[]
  activeAssignments: any[]
}

export function WorkerManagementDashboard({
  workers,
  pendingWorkers = [],
  leaderboard,
  availability,
  activeAssignments
}: WorkerManagementDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWorker, setSelectedWorker] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')

  // Calculate stats
  const availableToday = availability.filter(a => a.is_available).length
  const totalActive = workers.length
  const utilizationRate = activeAssignments.length / (totalActive * 3) * 100 // Assuming max 3 tasks per worker

  const filteredWorkers = workers.filter(worker =>
    worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    worker.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-theme-bg-primary">
      {/* Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-primary">Worker Management</h1>
            <p className="text-zinc-400 mt-1">
              Monitor performance and manage workforce
            </p>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Workers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActive}</div>
              <p className="text-xs text-muted-foreground">
                Active workforce
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Today
              </CardTitle>
              <UserCheck className="h-4 w-4 text-theme-status-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availableToday}</div>
              <p className="text-xs text-muted-foreground">
                Ready to work
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Utilization Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{utilizationRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Workforce capacity
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
                In progress
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="availability">Availability</TabsTrigger>
            <TabsTrigger value="directory">Directory</TabsTrigger>
            {pendingWorkers.length > 0 && (
              <TabsTrigger value="pending" className="relative">
                Pending Approvals
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {pendingWorkers.length}
                </Badge>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WorkerLeaderboard leaderboard={leaderboard} />
              <WorkerPerformanceChart workers={workers} />
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.worker.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl font-bold text-zinc-500">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{entry.worker.name}</p>
                          <p className="text-sm text-muted-foreground">{entry.worker.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-8 text-right">
                        <div>
                          <p className="text-sm text-muted-foreground">Units</p>
                          <p className="font-medium">{entry.unitsCompleted}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Quality</p>
                          <p className="font-medium">{entry.qualityRate.toFixed(1)}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Efficiency</p>
                          <p className="font-medium">{entry.efficiency.toFixed(1)}/hr</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedWorker(entry.worker)}
                      >
                        View Details
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="availability" className="space-y-6">
            <WorkerAvailabilityGrid 
              workers={workers}
              availability={availability}
            />
          </TabsContent>

          <TabsContent value="directory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Worker Directory</CardTitle>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search workers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredWorkers.map((worker) => {
                    const workerAssignments = activeAssignments.filter(a => a.worker_id === worker.id)
                    
                    return (
                      <div key={worker.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg hover:bg-zinc-800 transition-colors">
                        <div>
                          <p className="font-medium">{worker.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{worker.role}</Badge>
                            <span className="text-sm text-muted-foreground">{worker.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Active Tasks</p>
                            <p className="font-medium">{workerAssignments.length}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedWorker(worker)}
                          >
                            View Profile
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Pending Worker Approvals</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review and approve new worker registrations
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingWorkers.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between p-4 bg-zinc-900 rounded-lg">
                      <div>
                        <p className="font-medium">{worker.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{worker.role}</Badge>
                          <span className="text-sm text-muted-foreground">{worker.email}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Registered: {new Date(worker.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/admin/workers/${worker.id}/approve`, {
                                method: 'POST'
                              })
                              if (response.ok) {
                                // Refresh the page to update the lists
                                window.location.reload()
                              }
                            } catch (error) {
                              console.error('Failed to approve worker:', error)
                            }
                          }}
                        >
                          Approve
                        </Button>
                        <Button variant="outline" size="sm">
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingWorkers.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No pending approvals
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Worker Detail Modal */}
      {selectedWorker && (
        <WorkerDetailModal
          worker={selectedWorker}
          assignments={activeAssignments.filter(a => a.worker_id === selectedWorker.id)}
          onClose={() => setSelectedWorker(null)}
        />
      )}
    </div>
  )
}