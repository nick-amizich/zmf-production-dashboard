"use client"

import { useState, useRef, useEffect } from "react"
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
  Loader2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { STAGE_COLORS } from "@/types/calendar-assignments"
import { ProductionCalendarAPI } from '@/lib/api/production-calendar-api'
import { 
  type CalendarBatch,
  type CalendarWorker,
  type CalendarAssignment
} from '@/lib/services/production-calendar-service'
import { logger } from '@/lib/logger'
import { toast } from 'sonner'
import { useMultiRealtime } from '@/hooks/use-realtime'

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

  // State for data
  const [isLoading, setIsLoading] = useState(true)
  const [batches, setBatches] = useState<CalendarBatch[]>([])
  const [workers, setWorkers] = useState<CalendarWorker[]>([])
  const [assignments, setAssignments] = useState<CalendarAssignment[]>([])

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
  const [draggedAssignment, setDraggedAssignment] = useState<any>(null)

  // Load calendar data
  useEffect(() => {
    loadCalendarData()
  }, [startDate])

  const loadCalendarData = async () => {
    try {
      setIsLoading(true)
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 13) // 2 weeks view

      const data = await ProductionCalendarAPI.getCalendarData(startDate, endDate)
      
      setBatches(data.batches)
      setWorkers(data.workers)
      setAssignments(data.assignments)
      setIsLoading(false)
    } catch (error) {
      logger.error('Failed to load calendar data', error)
      toast.error('Failed to load calendar data')
      setIsLoading(false)
    }
  }

  // Subscribe to real-time updates
  useMultiRealtime({
    subscriptions: [
      { table: 'batches' },
      { table: 'stage_assignments' },
      { table: 'employees' }
    ],
    onChange: (table, payload) => {
      logger.debug(`Calendar real-time update from ${table}`, payload)
      // Reload calendar data when changes occur
      loadCalendarData()
    }
  })

  // Generate calendar days
  const generateCalendarDays = (): CalendarDay[] => {
    const days: CalendarDay[] = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push({
        date,
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isHoliday: false, // Could integrate with holiday API
        isToday: date.toDateString() === today.toDateString(),
      })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  // Navigation functions
  const goToPrevWeek = () => {
    const newDate = new Date(startDate)
    newDate.setDate(newDate.getDate() - 7)
    setStartDate(newDate)
  }

  const goToNextWeek = () => {
    const newDate = new Date(startDate)
    newDate.setDate(newDate.getDate() + 7)
    setStartDate(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    setStartDate(new Date(today.setDate(today.getDate() + diff)))
  }

  // Get assignments for a specific cell
  const getAssignmentsForCell = (workerId: string, date: string) => {
    return assignments.filter(
      a => a.workerId === workerId && a.date === date
    )
  }

  // Assignment management
  const handleCellClick = (workerId: string, date: string) => {
    setSelectedCell({ workerId, date })
    setIsAssignmentOpen(true)
  }

  const handleAssignBatch = async () => {
    if (!selectedCell || !selectedBatch) return

    try {
      const batch = batches.find(b => b.id === selectedBatch)
      if (!batch) return

      await ProductionCalendarAPI.createAssignment({
        workerId: selectedCell.workerId,
        batchId: selectedBatch,
        date: selectedCell.date,
        stage: batch.stage,
        hours: assignmentHours
      })

      toast.success('Assignment created successfully')
      setIsAssignmentOpen(false)
      loadCalendarData()
    } catch (error) {
      logger.error('Failed to create assignment', error)
      toast.error('Failed to create assignment')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, assignment: CalendarAssignment) => {
    setDraggedAssignment(assignment)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, workerId: string, date: string) => {
    e.preventDefault()
    
    if (!draggedAssignment) return

    try {
      await ProductionCalendarAPI.updateAssignment(draggedAssignment.id, {
        workerId,
        date
      })

      toast.success('Assignment moved successfully')
      loadCalendarData()
    } catch (error) {
      logger.error('Failed to move assignment', error)
      toast.error('Failed to move assignment')
    } finally {
      setDraggedAssignment(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-theme-text-secondary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Header */}
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-theme-text-secondary hover:bg-theme-brand-secondary/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-theme-text-secondary" />
              <div>
                <h1 className="text-2xl font-bold text-theme-text-secondary">Production Calendar</h1>
                <p className="text-sm text-theme-text-tertiary">Schedule and manage production assignments</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCalendarData}
              className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button
              size="sm"
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
              onClick={() => setIsModelPopupOpen(true)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter by Model
            </Button>
          </div>
        </div>
      </header>

      {/* Calendar Navigation */}
      <div className="px-6 py-4 border-b border-theme-border-primary bg-theme-bg-secondary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevWeek}
              className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20"
            >
              <Home className="h-4 w-4 mr-2" />
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToNextWeek}
              className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="text-theme-text-secondary font-medium">
            {startDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6 overflow-x-auto" ref={calendarRef}>
        <div className="min-w-[1400px]">
          {/* Date Headers */}
          <div className="grid grid-cols-15 gap-2 mb-4">
            <div className="col-span-1" /> {/* Empty cell for worker column */}
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`text-center p-2 rounded ${
                  day.isToday
                    ? "bg-theme-brand-secondary/20 border border-theme-brand-secondary"
                    : day.isWeekend
                    ? "bg-theme-bg-secondary/50"
                    : ""
                }`}
              >
                <div className="text-xs text-theme-text-tertiary">
                  {day.date.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div className={`text-lg font-semibold ${
                  day.isToday ? "text-theme-brand-secondary" : "text-theme-text-secondary"
                }`}>
                  {day.date.getDate()}
                </div>
              </div>
            ))}
          </div>

          {/* Worker Rows */}
          {workers.map((worker) => (
            <div key={worker.id} className="grid grid-cols-15 gap-2 mb-2">
              {/* Worker Info */}
              <div className="col-span-1 p-3 bg-theme-bg-secondary rounded border border-theme-border-primary">
                <div className="font-medium text-theme-text-secondary">{worker.name}</div>
                <div className="text-xs text-theme-text-tertiary">{worker.skills.join(", ")}</div>
                <Badge
                  variant="outline"
                  className={`mt-1 text-xs ${
                    worker.status === "active"
                      ? "border-theme-status-success text-theme-status-success"
                      : worker.status === "break"
                      ? "border-theme-status-warning text-theme-status-warning"
                      : "border-gray-500 text-gray-500"
                  }`}
                >
                  {worker.status}
                </Badge>
              </div>

              {/* Calendar Cells */}
              {calendarDays.map((day, dayIndex) => {
                const dateStr = day.date.toISOString().split('T')[0]
                const cellAssignments = getAssignmentsForCell(worker.id, dateStr)

                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[80px] p-2 rounded border ${
                      day.isWeekend
                        ? "bg-gray-50/5 border-theme-border-primary/50"
                        : "bg-theme-bg-secondary/30 border-theme-border-primary hover:border-theme-brand-secondary/50"
                    } cursor-pointer transition-colors`}
                    onClick={() => !day.isWeekend && handleCellClick(worker.id, dateStr)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, worker.id, dateStr)}
                  >
                    {cellAssignments.map((assignment) => {
                      const batch = batches.find(b => b.id === assignment.batchId)
                      if (!batch) return null

                      return (
                        <div
                          key={assignment.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, assignment)}
                          className={`mb-1 p-1 rounded text-xs cursor-move ${
                            STAGE_COLORS[batch.stage as keyof typeof STAGE_COLORS] || 'bg-gray-500'
                          } text-white`}
                        >
                          <div className="flex items-center gap-1">
                            <GripVertical className="h-3 w-3 opacity-50" />
                            <span className="font-medium">{batch.batchNumber}</span>
                          </div>
                          <div className="text-xs opacity-90">{batch.model}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{assignment.hours}h</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Assignment Dialog */}
      <Dialog open={isAssignmentOpen} onOpenChange={setIsAssignmentOpen}>
        <DialogContent className="bg-theme-bg-primary border-theme-border-primary">
          <DialogHeader>
            <DialogTitle className="text-theme-text-secondary">Assign Batch</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-theme-text-secondary">Select Batch</label>
              <Select value={selectedBatch || ""} onValueChange={setSelectedBatch}>
                <SelectTrigger className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
                  <SelectValue placeholder="Choose a batch" />
                </SelectTrigger>
                <SelectContent>
                  {batches.map((batch) => (
                    <SelectItem key={batch.id} value={batch.id}>
                      <div className="flex items-center gap-2">
                        <span>{batch.batchNumber}</span>
                        <span className="text-xs text-theme-text-tertiary">
                          {batch.model} ({batch.quantity} units)
                        </span>
                        {batch.priority !== 'normal' && (
                          <Badge
                            variant={batch.priority === 'urgent' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {batch.priority}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-theme-text-secondary">Hours</label>
              <Select value={assignmentHours.toString()} onValueChange={(v) => setAssignmentHours(Number(v))}>
                <SelectTrigger className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2, 4, 6, 8].map((hours) => (
                    <SelectItem key={hours} value={hours.toString()}>
                      {hours} hours
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignmentOpen(false)}
              className="border-theme-border-active text-theme-text-secondary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignBatch}
              disabled={!selectedBatch}
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
            >
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}