"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Save,
  Filter,
  Star,
  X,
  Plus,
  Package,
  ArrowLeft,
  Home,
  GripVertical,
  Clock,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useCalendarAssignments } from "./hooks/use-calendar-assignments"
import { STAGE_COLORS } from "./types/calendar-assignments"

interface Batch {
  id: string
  batchNumber: string
  model: string
  quantity: number
  stage: string
  estimatedHours: number
  priority: "normal" | "high" | "urgent"
}

interface CalendarDay {
  date: Date
  isWeekend: boolean
  isHoliday: boolean
  isToday: boolean
}

interface ProductionCalendarProps {
  onBack: () => void
}

export default function ProductionCalendar({ onBack }: ProductionCalendarProps) {
  // State for calendar navigation
  const [startDate, setStartDate] = useState<Date>(() => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Start on Monday
    return new Date(today.setDate(today.getDate() + diff))
  })

  // State for popup
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ workerId: string; date: string } | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [assignmentHours, setAssignmentHours] = useState<number>(4)

  // State for model selection popup
  const [isModelPopupOpen, setIsModelPopupOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)

  // Horizontal scroll handling
  const calendarRef = useRef<HTMLDivElement>(null)

  const { assignments, workers, moveAssignment, getAssignmentsForCell } = useCalendarAssignments()

  const [draggedAssignment, setDraggedAssignment] = useState<any>(null)
  const [batches] = useState<Batch[]>([
    {
      id: "b1",
      batchNumber: "230901-A",
      model: "OM-42",
      quantity: 12,
      stage: "Intake",
      estimatedHours: 8,
      priority: "high",
    },
    {
      id: "b2",
      batchNumber: "230901-B",
      model: "D-28",
      quantity: 8,
      stage: "Sanding",
      estimatedHours: 12,
      priority: "urgent",
    },
    {
      id: "b3",
      batchNumber: "230901-C",
      model: "000-18",
      quantity: 15,
      stage: "Finishing",
      estimatedHours: 16,
      priority: "normal",
    },
    {
      id: "b4",
      batchNumber: "230901-D",
      model: "OM-28",
      quantity: 10,
      stage: "Sub-Assembly",
      estimatedHours: 10,
      priority: "normal",
    },
    {
      id: "b5",
      batchNumber: "230901-E",
      model: "D-45",
      quantity: 5,
      stage: "Final Assembly",
      estimatedHours: 20,
      priority: "high",
    },
    {
      id: "b6",
      batchNumber: "230901-F",
      model: "00-17",
      quantity: 20,
      stage: "Acoustic QC",
      estimatedHours: 4,
      priority: "normal",
    },
    {
      id: "b7",
      batchNumber: "230901-G",
      model: "D-18",
      quantity: 18,
      stage: "Shipping",
      estimatedHours: 2,
      priority: "normal",
    },
    {
      id: "b8",
      batchNumber: "230902-A",
      model: "OM-42",
      quantity: 10,
      stage: "Intake",
      estimatedHours: 8,
      priority: "normal",
    },
    {
      id: "b9",
      batchNumber: "230902-B",
      model: "D-28",
      quantity: 12,
      stage: "Sanding",
      estimatedHours: 12,
      priority: "high",
    },
    {
      id: "b10",
      batchNumber: "230902-C",
      model: "000-18",
      quantity: 8,
      stage: "Finishing",
      estimatedHours: 16,
      priority: "urgent",
    },
    {
      id: "b11",
      batchNumber: "230902-D",
      model: "OM-28",
      quantity: 15,
      stage: "Sub-Assembly",
      estimatedHours: 10,
      priority: "normal",
    },
    {
      id: "b12",
      batchNumber: "230902-E",
      model: "D-45",
      quantity: 20,
      stage: "Final Assembly",
      estimatedHours: 20,
      priority: "normal",
    },
  ])

  // Generate calendar days
  const calendarDays: CalendarDay[] = []
  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    const isToday = new Date().toDateString() === date.toDateString()
    calendarDays.push({
      date,
      isWeekend,
      isHoliday: false,
      isToday,
    })
  }

  // Format date as YYYY-MM-DD for comparison
  const formatDateKey = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  // Handle cell click to open assignment popup
  const handleCellClick = (workerId: string, date: CalendarDay) => {
    setSelectedCell({ workerId, date: formatDateKey(date.date) })
    setIsAssignmentOpen(true)
  }

  // Handle assignment creation
  const handleCreateAssignment = () => {
    if (!selectedCell || !selectedBatch) return

    setIsAssignmentOpen(false)
    setSelectedCell(null)
    setSelectedBatch(null)
    setAssignmentHours(4)
  }

  // Handle horizontal scrolling with buttons
  const scrollCalendar = (direction: "left" | "right") => {
    if (calendarRef.current) {
      const scrollAmount = direction === "left" ? -600 : 600
      calendarRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  // Navigate calendar weeks
  const navigateWeeks = (direction: "prev" | "next") => {
    const newDate = new Date(startDate)
    newDate.setDate(startDate.getDate() + (direction === "prev" ? -7 : 7))
    setStartDate(newDate)
  }

  // Get worker by ID
  const getWorker = (workerId: string) => {
    return workers.find((worker) => worker.id === workerId)
  }

  // Get batch by ID
  const getBatch = (batchId: string) => {
    return batches.find((batch) => batch.id === batchId)
  }

  // Get available hours for a worker on a specific date
  const getAvailableHours = (workerId: string, date: string) => {
    const worker = getWorker(workerId)
    if (!worker) return 0

    const dailyCapacity = worker.weeklyCapacity / 5 // Assuming 5-day work week
    const assignedHours = assignments
      .filter((a) => a.workerId === workerId && a.date === date)
      .reduce((total, a) => total + a.hours, 0)

    return Math.max(0, dailyCapacity - assignedHours)
  }

  // Render skill level stars
  const renderSkillLevel = (level: number) => {
    return Array(level)
      .fill(0)
      .map((_, i) => <Star key={i} className="h-4 w-4 text-[#d4a574] fill-[#d4a574]" />)
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "short", month: "numeric", day: "numeric" })
  }

  // Get stage color for visual indicators
  const getStageColor = (stage: string) => {
    const stageColors = {
      Intake: "bg-blue-600",
      Sanding: "bg-yellow-600",
      Finishing: "bg-purple-600",
      "Sub-Assembly": "bg-green-600",
      "Final Assembly": "bg-orange-600",
      "Acoustic QC": "bg-red-600",
      Shipping: "bg-gray-600",
    }
    return stageColors[stage as keyof typeof stageColors] || "bg-gray-600"
  }

  // Handle model click to show batch selection popup
  const handleModelClick = (model: string) => {
    setSelectedModel(model)
    setIsModelPopupOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
      {/* Header */}
      <header className="border-b border-[#8B4513]/30 bg-[#1a0d08]/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-[#d4a574]" />
            <div>
              <h1 className="text-2xl font-bold text-[#d4a574]">Production Workflow Calendar</h1>
              <p className="text-sm text-gray-400">Two-week scheduling and workload management</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={onBack} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#8B4513] text-[#d4a574]"
                onClick={() => navigateWeeks("prev")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-[#d4a574] font-medium">
                {formatDate(startDate)} - {formatDate(calendarDays[calendarDays.length - 1].date)}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#8B4513] text-[#d4a574]"
                onClick={() => navigateWeeks("next")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="h-6 border-r border-[#8B4513]/30" />

            <div className="text-sm">
              <span className="text-[#d4a574]">12 Active Batches</span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-[#d4a574]">8 Workers Available</span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-[#d4a574]">94% Capacity</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select>
              <SelectTrigger className="w-[180px] bg-[#1a0d08] border-[#8B4513]/30 text-white">
                <SelectValue placeholder="All Workers" />
              </SelectTrigger>
              <SelectContent className="bg-[#1a0d08] border-[#8B4513]/30">
                <SelectItem value="all" className="text-white">
                  All Workers
                </SelectItem>
                <SelectItem value="available" className="text-white">
                  Available Only
                </SelectItem>
                <SelectItem value="expert" className="text-white">
                  Expert Level
                </SelectItem>
                <SelectItem value="experienced" className="text-white">
                  Experienced Level
                </SelectItem>
                <SelectItem value="learning" className="text-white">
                  Learning Level
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>

            <Button variant="outline" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
              <Save className="h-4 w-4 mr-2" />
              Save Schedule
            </Button>
          </div>
        </div>
      </header>

      {/* Calendar Grid */}
      <div className="p-6">
        <div className="flex">
          {/* Worker Column (Y-axis) */}
          <div className="min-w-[220px] mr-4">
            <div className="h-10 mb-2 flex items-center justify-center">
              <Badge className="bg-[#8B4513]">{workers.length} Workers</Badge>
            </div>

            <div className="space-y-2">
              {workers.map((worker) => (
                <Card
                  key={worker.id}
                  className={`bg-[#1a0d08] border-[#8B4513]/30 ${!worker.available ? "opacity-60" : ""}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={worker.photo || "/placeholder.svg"}
                          alt={worker.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div
                          className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#1a0d08] ${
                            worker.available
                              ? worker.scheduledHours >= worker.weeklyCapacity
                                ? "bg-red-500"
                                : worker.scheduledHours >= worker.weeklyCapacity * 0.8
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              : "bg-gray-500"
                          }`}
                        />
                      </div>
                      <div>
                        <div className="font-medium text-[#d4a574]">{worker.name}</div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{worker.primarySkill}</span>
                          <div className="flex">{renderSkillLevel(worker.skillLevel)}</div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {worker.scheduledHours}/{worker.weeklyCapacity}h scheduled
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Calendar Grid (X-axis and cells) */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center mb-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#8B4513] text-[#d4a574] mr-2"
                onClick={() => scrollCalendar("left")}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex-1 overflow-hidden">
                <div className="flex">
                  {calendarDays.map((day, index) => (
                    <div
                      key={index}
                      className={`min-w-[120px] h-10 flex items-center justify-center px-2 text-sm font-medium ${
                        day.isWeekend ? "text-gray-500" : day.isToday ? "text-[#d4a574]" : "text-white"
                      } ${day.isToday ? "border-b-2 border-[#d4a574]" : ""}`}
                    >
                      {formatDate(day.date)}
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 border-[#8B4513] text-[#d4a574] ml-2"
                onClick={() => scrollCalendar("right")}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid Cells */}
            <div className="overflow-x-auto" ref={calendarRef}>
              <div className="flex flex-col space-y-2">
                {workers.map((worker) => (
                  <div key={worker.id} className="flex min-w-max">
                    {calendarDays.map((day, dayIndex) => {
                      const cellAssignments = getAssignmentsForCell(worker.id, day.date)

                      return (
                        <div
                          key={dayIndex}
                          className={`min-w-[120px] h-[80px] border border-[#8B4513]/20 bg-[#1a0d08] ${
                            day.isWeekend ? "opacity-60" : ""
                          } ${day.isToday ? "border-[#d4a574]/50" : ""} p-1 overflow-hidden cursor-pointer hover:border-[#d4a574]/70 transition-colors`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (draggedAssignment) {
                              moveAssignment(draggedAssignment.id, worker.id, day.date.toISOString().split("T")[0])
                              setDraggedAssignment(null)
                            }
                          }}
                        >
                          {cellAssignments.length > 0 ? (
                            <div className="h-full flex flex-col">
                              <div className="text-xs text-gray-400 mb-1">
                                {cellAssignments.reduce((sum, a) => sum + a.hours, 0)}h
                              </div>
                              <div className="flex-1 overflow-y-auto space-y-1">
                                {cellAssignments.map((assignment) => (
                                  <div
                                    key={assignment.id}
                                    draggable
                                    onDragStart={() => setDraggedAssignment(assignment)}
                                    className={`text-xs p-1 rounded cursor-move hover:opacity-80 transition-opacity ${
                                      STAGE_COLORS[assignment.stage as keyof typeof STAGE_COLORS]
                                    } text-white`}
                                  >
                                    <div className="flex items-center gap-1">
                                      <GripVertical className="h-2 w-2" />
                                      <div>
                                        <div className="font-medium truncate">{assignment.stage}</div>
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-2 w-2" />
                                          <span>{assignment.hours}h</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                              {day.isWeekend ? "Weekend" : "Available"}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentOpen} onOpenChange={setIsAssignmentOpen}>
        <DialogContent className="bg-[#1a0d08] border-[#8B4513]/30 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#d4a574]">
              {selectedCell && (
                <>
                  Assign Work to {getWorker(selectedCell.workerId)?.name} -{" "}
                  {new Date(selectedCell.date).toLocaleDateString()}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedCell && (
            <div className="space-y-6">
              <div className="bg-[#0a0a0a] p-3 rounded border border-[#8B4513]/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-gray-400">Worker Assignment:</div>
                  <Badge className="bg-green-600">
                    {getAvailableHours(selectedCell.workerId, selectedCell.date)} hours available
                  </Badge>
                </div>
                <div className="text-[#d4a574] font-medium">
                  {getWorker(selectedCell.workerId)?.name} - {new Date(selectedCell.date).toLocaleDateString()}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Hours to Assign</label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8B4513]/30 text-white"
                    onClick={() => setAssignmentHours(Math.max(1, assignmentHours - 1))}
                  >
                    -
                  </Button>
                  <div className="bg-[#0a0a0a] border border-[#8B4513]/30 rounded px-4 py-2 min-w-[60px] text-center">
                    {assignmentHours}h
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-[#8B4513]/30 text-white"
                    onClick={() => setAssignmentHours(Math.min(8, assignmentHours + 1))}
                  >
                    +
                  </Button>
                  <div className="text-sm text-gray-400 ml-2">
                    {selectedCell && `(${getAvailableHours(selectedCell.workerId, selectedCell.date)} hours available)`}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAssignmentOpen(false)}
                  className="border-[#8B4513]/30 text-white hover:bg-[#8B4513]/20"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateAssignment}
                  disabled={!selectedBatch}
                  className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Assign Work
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Model Batch Selection Dialog */}
      <Dialog open={isModelPopupOpen} onOpenChange={setIsModelPopupOpen}>
        <DialogContent className="bg-[#1a0d08] border-[#8B4513]/30 text-white max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-[#d4a574] text-xl">Select Batch - {selectedModel}</DialogTitle>
            <p className="text-gray-400">Choose a specific batch to assign</p>
          </DialogHeader>

          {selectedModel && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {batches
                .filter((batch) => batch.model === selectedModel)
                .sort((a, b) => {
                  // Sort by priority first, then by batch number
                  const priorityOrder = { urgent: 3, high: 2, normal: 1 }
                  if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                    return priorityOrder[b.priority] - priorityOrder[a.priority]
                  }
                  return b.batchNumber.localeCompare(a.batchNumber)
                })
                .map((batch) => (
                  <div
                    key={batch.id}
                    className={`p-4 rounded border cursor-pointer transition-colors ${
                      selectedBatch === batch.id
                        ? "bg-[#8B4513]/30 border-[#d4a574]"
                        : "bg-[#0a0a0a] border-[#8B4513]/20 hover:border-[#8B4513]"
                    }`}
                    onClick={() => {
                      setSelectedBatch(batch.id)
                      setIsModelPopupOpen(false)
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Package className="h-5 w-5 text-[#d4a574]" />
                        <div>
                          <div className="font-medium text-[#d4a574]">{batch.batchNumber}</div>
                          <div className="text-sm text-gray-400">{batch.quantity} units</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`${getStageColor(batch.stage)} text-white border-none`}>
                          Ready for {batch.stage}
                        </Badge>
                        <Badge
                          className={`${
                            batch.priority === "urgent"
                              ? "bg-red-600"
                              : batch.priority === "high"
                                ? "bg-amber-600"
                                : "bg-blue-600"
                          }`}
                        >
                          {batch.priority.toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-gray-400">Current Stage</div>
                        <div className="text-white">{batch.stage}</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Estimated Hours</div>
                        <div className="text-white">{batch.estimatedHours}h</div>
                      </div>
                      <div>
                        <div className="text-gray-400">Status</div>
                        <div className="text-green-400">Ready to Assign</div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModelPopupOpen(false)}
              className="border-[#8B4513]/30 text-white hover:bg-[#8B4513]/20"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
