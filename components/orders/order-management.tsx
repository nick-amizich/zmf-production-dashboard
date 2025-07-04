"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Calendar,
  Users,
  Settings,
  Save,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Clock,
} from "lucide-react"
import { useCalendarAssignments } from "@/hooks/use-calendar-assignments"
import { PRODUCTION_STAGES, STAGE_COLORS, type Worker } from "@/types/calendar-assignments"

interface CalendarAssignment {
  id: string
  workerId: string
  stage: string
  date: string
  hours: number
  batchId?: string
}

interface BatchOrderAssignmentProps {
  onBack: () => void
}

export default function BatchOrderAssignment({ onBack }: BatchOrderAssignmentProps) {
  const { assignments, workers, updateWorkers, moveAssignment, getAssignmentsForCell, generateAssignmentsFromWorkers } =
    useCalendarAssignments()

  const [draggedAssignment, setDraggedAssignment] = useState<CalendarAssignment | null>(null)

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    return new Date(today.setDate(today.getDate() + diff))
  })

  const getWeekDays = () => {
    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(currentWeekStart)
      nextDay.setDate(currentWeekStart.getDate() + i)
      weekDays.push(nextDay)
    }
    return weekDays
  }

  // Update worker stage assignment
  const updateWorkerStageAssignment = (workerId: string, stage: string, days: number) => {
    const updatedWorkers = workers.map((worker) =>
      worker.id === workerId
        ? {
            ...worker,
            stageAssignments: {
              ...worker.stageAssignments!,
              [stage]: days,
            },
          }
        : worker,
    )
    updateWorkers(updatedWorkers)
  }

  // Generate calendar assignments based on worker stage assignments
  const generateCalendarAssignments = () => {
    generateAssignmentsFromWorkers(currentWeekStart)
  }

  // Handle drag start
  const handleDragStart = (assignment: CalendarAssignment) => {
    setDraggedAssignment(assignment)
  }

  // Handle drop
  const handleDrop = (targetWorkerId: string, targetDate: Date) => {
    if (!draggedAssignment) return

    const targetDateStr = targetDate.toISOString().split("T")[0]

    moveAssignment(draggedAssignment.id, targetWorkerId, targetDateStr)

    setDraggedAssignment(null)
  }

  // Navigate weeks
  const navigateWeek = (direction: "prev" | "next") => {
    const newDate = new Date(currentWeekStart)
    newDate.setDate(currentWeekStart.getDate() + (direction === "prev" ? -7 : 7))
    setCurrentWeekStart(newDate)
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })
  }

  // Get total days assigned for a worker
  const getTotalDaysAssigned = (worker: Worker) => {
    if (!worker.stageAssignments) return 0
    const total = Object.values(worker.stageAssignments).reduce((sum, days) => sum + days, 0)
    return total
  }
  
  const formatTotalDaysAssigned = (worker: Worker) => {
    const total = getTotalDaysAssigned(worker)
    return total % 1 === 0 ? total.toString() : total.toFixed(1)
  }

  // Render skill level stars
  const renderSkillLevel = (level: number) => {
    return Array(level)
      .fill(0)
      .map((_, i) => <div key={i} className="h-2 w-2 bg-theme-brand-primary rounded-full" />)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Header */}
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Production Menu
            </Button>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-theme-text-secondary" />
              <div>
                <h1 className="text-2xl font-bold text-theme-text-secondary">Batch Order Assignment</h1>
                <p className="text-sm text-theme-text-tertiary">Configure worker stage assignments and schedule</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20">
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            <Button variant="outline" className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-theme-bg-secondary border border-theme-border-primary">
              <TabsTrigger
                value="assignments"
                className="data-[state=active]:bg-theme-brand-secondary data-[state=active]:text-theme-text-primary"
              >
                <Users className="h-4 w-4 mr-2" />
                Worker Stage Assignments
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-theme-brand-secondary data-[state=active]:text-theme-text-primary">
                <Calendar className="h-4 w-4 mr-2" />
                Weekly Schedule Calendar
              </TabsTrigger>
            </TabsList>

            <Button onClick={generateCalendarAssignments} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
              <Calendar className="h-4 w-4 mr-2" />
              Assign Work to Calendar
            </Button>
          </div>

          {/* Worker Stage Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="grid gap-6">
              {workers.map((worker) => (
                <Card key={worker.id} className="bg-theme-bg-secondary border-theme-border-primary">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={worker.photo || "/placeholder.svg"}
                          alt={worker.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <CardTitle className="text-theme-text-secondary">{worker.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-theme-text-tertiary">{worker.primarySkill}</span>
                            <div className="flex gap-1">{renderSkillLevel(worker.skillLevel)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-theme-text-tertiary">Total Days Assigned</div>
                        <Badge
                          className={`${
                            getTotalDaysAssigned(worker) > 5
                              ? "bg-theme-status-error"
                              : getTotalDaysAssigned(worker) === 5
                                ? "bg-theme-status-success"
                                : "bg-yellow-600"
                          }`}
                        >
                          {formatTotalDaysAssigned(worker)}/5 days
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-4">
                      {PRODUCTION_STAGES.map((stage) => (
                        <div key={stage} className="space-y-2">
                          <div className="text-sm font-medium text-theme-text-secondary text-center">{stage}</div>
                          <div className={`h-2 rounded-full ${STAGE_COLORS[stage as keyof typeof STAGE_COLORS]}`} />
                          <Select
                            value={worker.stageAssignments?.[stage].toString() || "0"}
                            onValueChange={(value) =>
                              updateWorkerStageAssignment(worker.id, stage, Number.parseFloat(value))
                            }
                          >
                            <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
                              {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((days) => (
                                <SelectItem
                                  key={days}
                                  value={days.toString()}
                                  className="text-theme-text-primary hover:bg-theme-brand-secondary/20"
                                >
                                  {days === 0
                                    ? "0 days"
                                    : days === 1
                                      ? "1 day"
                                      : days % 1 === 0
                                        ? `${days} days`
                                        : `${days} days`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Weekly Schedule Calendar Tab */}
          <TabsContent value="calendar" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="border-theme-border-active text-theme-text-secondary"
                  onClick={() => navigateWeek("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-medium text-theme-text-secondary">Week of {formatDate(currentWeekStart)}</div>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-theme-border-active text-theme-text-secondary"
                  onClick={() => navigateWeek("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-theme-text-tertiary">Drag and drop assignments to reorganize the schedule</div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-theme-bg-secondary border border-theme-border-primary rounded-lg overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-6 border-b border-theme-border-primary">
                <div className="p-4 font-medium text-theme-text-secondary border-r border-theme-border-primary">Worker</div>
                {getWeekDays().map((date, index) => (
                  <div
                    key={index}
                    className="p-4 text-center font-medium text-theme-text-secondary border-r border-theme-border-primary last:border-r-0"
                  >
                    {formatDate(date)}
                  </div>
                ))}
              </div>

              {/* Worker Rows */}
              {workers.map((worker) => (
                <div key={worker.id} className="grid grid-cols-6 border-b border-theme-border-primary last:border-b-0">
                  {/* Worker Info Cell */}
                  <div className="p-4 border-r border-theme-border-primary bg-theme-bg-primary">
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.photo || "/placeholder.svg"}
                        alt={worker.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-theme-text-secondary text-sm">{worker.name}</div>
                        <div className="text-xs text-theme-text-tertiary">{worker.primarySkill}</div>
                      </div>
                    </div>
                  </div>

                  {/* Day Cells */}
                  {getWeekDays().map((date, dayIndex) => {
                    const assignments = getAssignmentsForCell(worker.id, date)

                    return (
                      <div
                        key={dayIndex}
                        className="p-2 border-r border-theme-border-primary last:border-r-0 min-h-[100px] bg-theme-bg-secondary"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDrop(worker.id, date)}
                      >
                        <div className="space-y-1">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              draggable
                              onDragStart={() => handleDragStart(assignment)}
                              className={`p-2 rounded text-xs cursor-move hover:opacity-80 transition-opacity ${
                                STAGE_COLORS[assignment.stage as keyof typeof STAGE_COLORS]
                              } text-theme-text-primary`}
                            >
                              <div className="flex items-center gap-1">
                                <GripVertical className="h-3 w-3" />
                                <div>
                                  <div className="font-medium">{assignment.stage}</div>
                                  <div className="flex items-center gap-1 text-xs opacity-80">
                                    <Clock className="h-2 w-2" />
                                    {assignment.hours}h
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
