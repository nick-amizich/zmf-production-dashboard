'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, Package, AlertTriangle, Plus, Edit, Copy, Trash2, Play, Pause, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock data for scheduled batches
const mockBatches = [
  {
    id: '1',
    batchNumber: 'BATCH-2024-001',
    priority: 'high',
    builds: 12,
    models: ['Atticus (4)', 'Verite (3)', 'Eikon (5)'],
    scheduledDate: '2024-01-22',
    estimatedDuration: 5,
    assignedWorkers: 4,
    status: 'scheduled',
    stage: null
  },
  {
    id: '2',
    batchNumber: 'BATCH-2024-002',
    priority: 'normal',
    builds: 8,
    models: ['Auteur (8)'],
    scheduledDate: '2024-01-23',
    estimatedDuration: 4,
    assignedWorkers: 3,
    status: 'scheduled',
    stage: null
  },
  {
    id: '3',
    batchNumber: 'BATCH-2024-003',
    priority: 'high',
    builds: 15,
    models: ['Caldera (10)', 'Atrium (5)'],
    scheduledDate: '2024-01-24',
    estimatedDuration: 6,
    assignedWorkers: 5,
    status: 'scheduled',
    stage: null
  },
  {
    id: '4',
    batchNumber: 'BATCH-2024-004',
    priority: 'low',
    builds: 6,
    models: ['Verite (6)'],
    scheduledDate: '2024-01-25',
    estimatedDuration: 3,
    assignedWorkers: 2,
    status: 'draft',
    stage: null
  },
  {
    id: '5',
    batchNumber: 'BATCH-2024-005',
    priority: 'normal',
    builds: 10,
    models: ['Eikon (5)', 'Atticus (5)'],
    scheduledDate: '2024-01-26',
    estimatedDuration: 5,
    assignedWorkers: 0,
    status: 'draft',
    stage: null
  }
]

const currentBatches = [
  {
    id: 'active-1',
    batchNumber: 'BATCH-2024-098',
    priority: 'high',
    builds: 10,
    completedBuilds: 7,
    stage: 'Final Assembly',
    startedAt: '2024-01-15',
    estimatedCompletion: '2024-01-20'
  },
  {
    id: 'active-2',
    batchNumber: 'BATCH-2024-099',
    priority: 'normal',
    builds: 8,
    completedBuilds: 3,
    stage: 'Sanding',
    startedAt: '2024-01-17',
    estimatedCompletion: '2024-01-21'
  }
]

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const timeSlots = ['8 AM', '10 AM', '12 PM', '2 PM', '4 PM', '6 PM']

export default function BatchSchedulerMockup() {
  const [selectedWeek, setSelectedWeek] = useState(0)
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week')

  // Generate week dates
  const getWeekDates = (weekOffset: number) => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() + 1 + (weekOffset * 7))
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek)
      date.setDate(startOfWeek.getDate() + i)
      return {
        day: weekDays[i],
        date: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        fullDate: date.toISOString().split('T')[0],
        isToday: date.toDateString() === today.toDateString()
      }
    })
  }

  const weekDates = getWeekDates(selectedWeek)

  const priorityColors = {
    high: 'bg-theme-status-error',
    normal: 'bg-theme-status-info',
    low: 'bg-theme-text-tertiary'
  }

  const statusColors = {
    scheduled: 'border-theme-brand-primary bg-theme-brand-primary/10',
    draft: 'border-theme-text-tertiary bg-theme-bg-primary',
    inProgress: 'border-theme-status-success bg-theme-status-success/10'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-theme-text-primary">Batch Scheduler</h1>
            <p className="text-theme-text-tertiary mt-1">Schedule and manage production batches</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-theme-border-secondary">
              <Copy className="w-4 h-4 mr-2" />
              Use Template
            </Button>
            <Button className="bg-theme-brand-primary hover:bg-theme-brand-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Batch
            </Button>
          </div>
        </div>

        {/* Active Batches Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentBatches.map(batch => (
            <Card key={batch.id} className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-theme-text-primary">{batch.batchNumber}</CardTitle>
                  <Badge className={`${priorityColors[batch.priority as keyof typeof priorityColors]} text-white`}>
                    {batch.priority} priority
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-theme-text-tertiary">Current Stage</span>
                    <span className="font-medium text-theme-text-primary">{batch.stage}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-theme-text-tertiary">Progress</span>
                      <span className="text-theme-text-primary">{batch.completedBuilds}/{batch.builds} builds</span>
                    </div>
                    <div className="w-full bg-theme-bg-primary rounded-full h-2">
                      <div 
                        className="bg-theme-status-success h-2 rounded-full transition-all"
                        style={{ width: `${(batch.completedBuilds / batch.builds) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-theme-text-tertiary">Est. Completion</span>
                    <span className="text-theme-text-primary">{batch.estimatedCompletion}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Calendar Controls */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedWeek(selectedWeek - 1)}
                  className="border-theme-border-secondary"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <h2 className="text-xl font-semibold text-theme-text-primary">
                  {weekDates[0].month} {weekDates[0].date} - {weekDates[6].month} {weekDates[6].date}
                </h2>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSelectedWeek(selectedWeek + 1)}
                  className="border-theme-border-secondary"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedWeek(0)}
                  className="border-theme-border-secondary"
                >
                  Today
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'week' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('week')}
                  className={viewMode === 'week' ? 'bg-theme-brand-primary' : 'border-theme-border-secondary'}
                >
                  Week
                </Button>
                <Button
                  variant={viewMode === 'month' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('month')}
                  className={viewMode === 'month' ? 'bg-theme-brand-primary' : 'border-theme-border-secondary'}
                >
                  Month
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Calendar Grid */}
            <div className="border-t border-theme-border-primary">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-theme-border-primary">
                {weekDates.map((day, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-4 text-center border-r border-theme-border-primary last:border-r-0",
                      day.isToday && "bg-theme-brand-primary/10"
                    )}
                  >
                    <div className="text-sm font-medium text-theme-text-tertiary">{day.day}</div>
                    <div className={cn(
                      "text-2xl font-semibold mt-1",
                      day.isToday ? "text-theme-brand-primary" : "text-theme-text-primary"
                    )}>
                      {day.date}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Slots */}
              {timeSlots.map((time, timeIndex) => (
                <div key={timeIndex} className="grid grid-cols-7 border-b border-theme-border-primary last:border-b-0">
                  {weekDates.map((day, dayIndex) => {
                    // Find batches scheduled for this day and time
                    const dayBatches = mockBatches.filter(batch => {
                      return batch.scheduledDate === day.fullDate && timeIndex === 0 // Simplified for mockup
                    })

                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "p-2 min-h-[120px] border-r border-theme-border-primary last:border-r-0",
                          day.isToday && "bg-theme-brand-primary/5"
                        )}
                      >
                        {timeIndex === 0 && <div className="text-xs text-theme-text-tertiary mb-1">{time}</div>}
                        
                        {/* Batch Cards */}
                        {dayBatches.map(batch => (
                          <div
                            key={batch.id}
                            className={cn(
                              "p-2 rounded-lg border-2 mb-2 cursor-pointer transition-all",
                              statusColors[batch.status as keyof typeof statusColors],
                              selectedBatch === batch.id && "ring-2 ring-theme-brand-primary"
                            )}
                            onClick={() => setSelectedBatch(batch.id)}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-theme-text-primary">
                                {batch.batchNumber}
                              </span>
                              <Badge className={`${priorityColors[batch.priority as keyof typeof priorityColors]} text-white text-xs px-1 py-0`}>
                                {batch.priority[0].toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-xs text-theme-text-tertiary">
                              <div className="flex items-center gap-1">
                                <Package className="w-3 h-3" />
                                {batch.builds} builds
                              </div>
                              <div className="flex items-center gap-1 mt-1">
                                <Users className="w-3 h-3" />
                                {batch.assignedWorkers || 'Unassigned'}
                              </div>
                            </div>
                            {batch.status === 'draft' && (
                              <div className="flex items-center gap-1 mt-1">
                                <AlertTriangle className="w-3 h-3 text-theme-status-warning" />
                                <span className="text-xs text-theme-status-warning">Draft</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Batch Details Panel */}
        {selectedBatch && (
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-theme-text-primary">Batch Details</CardTitle>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-theme-border-secondary">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="border-theme-border-secondary">
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm" className="border-theme-status-error text-theme-status-error hover:bg-theme-status-error/10">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {(() => {
                const batch = mockBatches.find(b => b.id === selectedBatch)
                if (!batch) return null

                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-theme-text-tertiary mb-2">Batch Information</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-theme-text-tertiary">Batch Number</span>
                            <span className="text-sm font-medium text-theme-text-primary">{batch.batchNumber}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-theme-text-tertiary">Priority</span>
                            <Badge className={`${priorityColors[batch.priority as keyof typeof priorityColors]} text-white`}>
                              {batch.priority}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-theme-text-tertiary">Status</span>
                            <span className="text-sm font-medium text-theme-text-primary capitalize">{batch.status}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-theme-text-tertiary">Est. Duration</span>
                            <span className="text-sm font-medium text-theme-text-primary">{batch.estimatedDuration} days</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-theme-text-tertiary mb-2">Models & Quantities</h3>
                        <div className="space-y-1">
                          {batch.models.map((model, index) => (
                            <div key={index} className="text-sm text-theme-text-primary">
                              {model}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-theme-text-tertiary mb-2">Resource Allocation</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-theme-text-tertiary">Assigned Workers</span>
                            <span className="text-sm font-medium text-theme-text-primary">
                              {batch.assignedWorkers > 0 ? `${batch.assignedWorkers} workers` : 'Unassigned'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-theme-text-tertiary">Total Builds</span>
                            <span className="text-sm font-medium text-theme-text-primary">{batch.builds} units</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button className="w-full bg-theme-brand-primary hover:bg-theme-brand-primary/90">
                          <Play className="w-4 h-4 mr-2" />
                          Start Production
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        )}

        {/* Capacity Overview */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <CardTitle className="text-theme-text-primary">Capacity Overview</CardTitle>
            <CardDescription className="text-theme-text-tertiary">
              Worker availability and workload for the selected week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-theme-bg-primary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-theme-status-success/20 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-theme-status-success" />
                  </div>
                  <div>
                    <div className="font-medium text-theme-text-primary">Available Workers</div>
                    <div className="text-sm text-theme-text-tertiary">Across all stages</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-theme-text-primary">24/30</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-theme-bg-primary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-theme-brand-primary/20 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-theme-brand-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-theme-text-primary">Total Hours Scheduled</div>
                    <div className="text-sm text-theme-text-tertiary">For the week</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-theme-text-primary">856</div>
              </div>

              <div className="flex items-center justify-between p-3 bg-theme-bg-primary rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-theme-status-warning/20 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-theme-status-warning" />
                  </div>
                  <div>
                    <div className="font-medium text-theme-text-primary">Capacity Utilization</div>
                    <div className="text-sm text-theme-text-tertiary">Current vs available</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-theme-status-warning">92%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}