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
import { useCalendarAssignments } from "./hooks/use-calendar-assignments"
import { PRODUCTION_STAGES, STAGE_COLORS, type Worker } from "./types/calendar-assignments"

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
    return total % 1 === 0 ? total : total.toFixed(1)
  }

  // Render skill level stars
  const renderSkillLevel = (level: number) => {
    return Array(level)
      .fill(0)
      .map((_, i) => <div key={i} className="h-2 w-2 bg-[#d4a574] rounded-full" />)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
      {/* Header */}
      <header className="border-b border-[#8B4513]/30 bg-[#1a0d08]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Production Menu
            </Button>
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-[#d4a574]" />
              <div>
                <h1 className="text-2xl font-bold text-[#d4a574]">Batch Order Assignment</h1>
                <p className="text-sm text-gray-400">Configure worker stage assignments and schedule</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
              <Save className="h-4 w-4 mr-2" />
              Save Configuration
            </Button>
            <Button variant="outline" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="assignments" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-[#1a0d08] border border-[#8B4513]/30">
              <TabsTrigger
                value="assignments"
                className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
              >
                <Users className="h-4 w-4 mr-2" />
                Worker Stage Assignments
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Weekly Schedule Calendar
              </TabsTrigger>
            </TabsList>

            <Button onClick={generateCalendarAssignments} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Assign Work to Calendar
            </Button>
          </div>

          {/* Worker Stage Assignments Tab */}
          <TabsContent value="assignments" className="space-y-6">
            <div className="grid gap-6">
              {workers.map((worker) => (
                <Card key={worker.id} className="bg-[#1a0d08] border-[#8B4513]/30">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={worker.photo || "/placeholder.svg"}
                          alt={worker.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div>
                          <CardTitle className="text-[#d4a574]">{worker.name}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm text-gray-400">{worker.primarySkill}</span>
                            <div className="flex gap-1">{renderSkillLevel(worker.skillLevel)}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Total Days Assigned</div>
                        <Badge
                          className={`${
                            getTotalDaysAssigned(worker) > 5
                              ? "bg-red-600"
                              : getTotalDaysAssigned(worker) === 5
                                ? "bg-green-600"
                                : "bg-yellow-600"
                          }`}
                        >
                          {getTotalDaysAssigned(worker)}/5 days
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-4">
                      {PRODUCTION_STAGES.map((stage) => (
                        <div key={stage} className="space-y-2">
                          <div className="text-sm font-medium text-[#d4a574] text-center">{stage}</div>
                          <div className={`h-2 rounded-full ${STAGE_COLORS[stage as keyof typeof STAGE_COLORS]}`} />
                          <Select
                            value={worker.stageAssignments?.[stage].toString() || "0"}
                            onValueChange={(value) =>
                              updateWorkerStageAssignment(worker.id, stage, Number.parseFloat(value))
                            }
                          >
                            <SelectTrigger className="bg-[#0a0a0a] border-[#8B4513]/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-[#1a0d08] border-[#8B4513]/30">
                              {[0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((days) => (
                                <SelectItem
                                  key={days}
                                  value={days.toString()}
                                  className="text-white hover:bg-[#8B4513]/20"
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
                  className="border-[#8B4513] text-[#d4a574]"
                  onClick={() => navigateWeek("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-lg font-medium text-[#d4a574]">Week of {formatDate(currentWeekStart)}</div>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-[#8B4513] text-[#d4a574]"
                  onClick={() => navigateWeek("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-gray-400">Drag and drop assignments to reorganize the schedule</div>
            </div>

            {/* Calendar Grid */}
            <div className="bg-[#1a0d08] border border-[#8B4513]/30 rounded-lg overflow-hidden">
              {/* Header Row */}
              <div className="grid grid-cols-6 border-b border-[#8B4513]/30">
                <div className="p-4 font-medium text-[#d4a574] border-r border-[#8B4513]/30">Worker</div>
                {getWeekDays().map((date, index) => (
                  <div
                    key={index}
                    className="p-4 text-center font-medium text-[#d4a574] border-r border-[#8B4513]/30 last:border-r-0"
                  >
                    {formatDate(date)}
                  </div>
                ))}
              </div>

              {/* Worker Rows */}
              {workers.map((worker) => (
                <div key={worker.id} className="grid grid-cols-6 border-b border-[#8B4513]/30 last:border-b-0">
                  {/* Worker Info Cell */}
                  <div className="p-4 border-r border-[#8B4513]/30 bg-[#0a0a0a]">
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.photo || "/placeholder.svg"}
                        alt={worker.name}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-[#d4a574] text-sm">{worker.name}</div>
                        <div className="text-xs text-gray-400">{worker.primarySkill}</div>
                      </div>
                    </div>
                  </div>

                  {/* Day Cells */}
                  {getWeekDays().map((date, dayIndex) => {
                    const assignments = getAssignmentsForCell(worker.id, date)

                    return (
                      <div
                        key={dayIndex}
                        className="p-2 border-r border-[#8B4513]/30 last:border-r-0 min-h-[100px] bg-[#1a0d08]"
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
                              } text-white`}
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
