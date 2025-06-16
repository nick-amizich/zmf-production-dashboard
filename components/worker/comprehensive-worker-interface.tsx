"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import {
  User,
  Clock,
  Play,
  Pause,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  Battery,
  ArrowLeft,
  ImageIcon,
  Award,
  Zap,
  CalendarDays,
} from "lucide-react"

// Types
interface Worker {
  id: string
  name: string
  photo: string
  pin: string
  currentShift: "day" | "evening" | "night"
  skills: string[]
  weeklySchedule: DailyAssignment[]
  todayStats: {
    hoursWorked: number
    tasksCompleted: number
    qualityScore: number
  }
}

interface DailyAssignment {
  date: string
  dayName: string
  isToday: boolean
  assignments: WorkAssignment[]
  totalEstimatedHours: number
  status: "upcoming" | "in-progress" | "completed"
}

interface WorkAssignment {
  id: string
  batchNumber: string
  orderNumber: string
  customerName: string
  model: string
  woodType: string
  stage: string
  stageNumber: number
  totalStages: number
  estimatedTime: string
  priority: "standard" | "rush" | "expedite"
  headphoneNumber: number
  totalInBatch: number
  specifications: {
    chassisType: "leather" | "vegan"
    grillColor: string
    padType: string
    specialInstructions?: string
  }
  qualityChecklist: QualityCheckItem[]
  referenceImages?: string[]
  batchNotes?: string
}

interface QualityCheckItem {
  id: string
  description: string
  category: "visual" | "measurement" | "functional" | "safety"
  requiresPhoto: boolean
  criticalPoint: boolean
  status: "pending" | "pass" | "fail"
  notes?: string
  photoTaken?: boolean
  timestamp?: Date
}

interface ComprehensiveWorkerInterfaceProps {
  onBack: () => void
}

type Screen =
  | "worker-selection-popup"
  | "weekly-schedule"
  | "active-work"
  | "quality-control"
  | "photo-capture"
  | "issue-report"
  | "task-complete"
  | "break-menu"

export default function ComprehensiveWorkerInterface({ onBack }: ComprehensiveWorkerInterfaceProps) {
  // State management
  const [currentScreen, setCurrentScreen] = useState<Screen>("worker-selection-popup")
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [currentAssignment, setCurrentAssignment] = useState<WorkAssignment | null>(null)
  const [todaysAssignments, setTodaysAssignments] = useState<WorkAssignment[]>([])
  const [currentAssignmentIndex, setCurrentAssignmentIndex] = useState(0)
  const [isOnline, setIsOnline] = useState(true)
  const [batteryLevel, setBatteryLevel] = useState(85)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const timerInterval = useRef<NodeJS.Timeout | null>(null)

  // Quality control state
  const [currentCheckIndex, setCurrentCheckIndex] = useState(0)
  const [qualityNotes, setQualityNotes] = useState("")
  const [showIssueDialog, setShowIssueDialog] = useState(false)
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])

  // Mock data
  const workers: Worker[] = [
    {
      id: "w1",
      name: "Tony Martinez",
      photo: "/placeholder.svg?height=120&width=120&text=Tony",
      pin: "1234",
      currentShift: "day",
      skills: ["Intake", "Robot Sanding", "Cup IQC"],
      todayStats: { hoursWorked: 6.5, tasksCompleted: 8, qualityScore: 98 },
      weeklySchedule: generateWeeklySchedule("Tony Martinez"),
    },
    {
      id: "w2",
      name: "Jake Thompson",
      photo: "/placeholder.svg?height=120&width=120&text=Jake",
      pin: "2345",
      currentShift: "day",
      skills: ["Cup Sanding", "Final Assembly", "QC"],
      todayStats: { hoursWorked: 7.2, tasksCompleted: 6, qualityScore: 96 },
      weeklySchedule: generateWeeklySchedule("Jake Thompson"),
    },
    {
      id: "w3",
      name: "Kevin Chen",
      photo: "/placeholder.svg?height=120&width=120&text=Kevin",
      pin: "3456",
      currentShift: "day",
      skills: ["Finishing", "Special Spray", "Wood Staining"],
      todayStats: { hoursWorked: 8.0, tasksCompleted: 4, qualityScore: 99 },
      weeklySchedule: generateWeeklySchedule("Kevin Chen"),
    },
    {
      id: "w4",
      name: "Matt Wilson",
      photo: "/placeholder.svg?height=120&width=120&text=Matt",
      pin: "4567",
      currentShift: "day",
      skills: ["Acoustic QC", "Measurement", "Final Testing"],
      todayStats: { hoursWorked: 5.5, tasksCompleted: 12, qualityScore: 97 },
      weeklySchedule: generateWeeklySchedule("Matt Wilson"),
    },
    {
      id: "w5",
      name: "Laura Davis",
      photo: "/placeholder.svg?height=120&width=120&text=Laura",
      pin: "5678",
      currentShift: "day",
      skills: ["Shipping", "Packaging", "Cable Assembly"],
      todayStats: { hoursWorked: 6.8, tasksCompleted: 15, qualityScore: 95 },
      weeklySchedule: generateWeeklySchedule("Laura Davis"),
    },
    {
      id: "w6",
      name: "Sam Rodriguez",
      photo: "/placeholder.svg?height=120&width=120&text=Sam",
      pin: "6789",
      currentShift: "day",
      skills: ["Sub-Assembly", "Chassis Build", "Baffle Assembly"],
      todayStats: { hoursWorked: 7.5, tasksCompleted: 7, qualityScore: 94 },
      weeklySchedule: generateWeeklySchedule("Sam Rodriguez"),
    },
  ]

  function generateWeeklySchedule(workerName: string): DailyAssignment[] {
    const today = new Date()
    const schedule: DailyAssignment[] = []

    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)

      const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
      const isToday = i === 0

      // Generate mock assignments for each day
      const assignments: WorkAssignment[] = []
      const numAssignments = Math.floor(Math.random() * 3) + 1 // 1-3 assignments per day

      for (let j = 0; j < numAssignments; j++) {
        assignments.push({
          id: `wa-${i}-${j}`,
          batchNumber: `BATCH-2024-${String(42 + i).padStart(3, "0")}`,
          orderNumber: `ZMF-2024-${String(157 + i * 10 + j).padStart(4, "0")}`,
          customerName: ["Sarah Johnson", "Mike Chen", "Emma Wilson", "David Brown"][j] || "Customer",
          model: ["Verite Closed", "Atticus", "Eikon", "Caldera"][j] || "Verite Closed",
          woodType: ["Sapele", "Walnut", "Cherry", "Cocobolo"][j] || "Sapele",
          stage: ["Intake", "Sanding", "Finishing", "Sub-Assembly", "Final Assembly", "Acoustic QC", "Shipping"][
            Math.floor(Math.random() * 7)
          ],
          stageNumber: Math.floor(Math.random() * 7) + 1,
          totalStages: 7,
          estimatedTime: ["1:30", "2:00", "2:30", "3:00"][j] || "2:00",
          priority: ["standard", "rush", "expedite"][Math.floor(Math.random() * 3)] as "standard" | "rush" | "expedite",
          headphoneNumber: j + 1,
          totalInBatch: numAssignments,
          specifications: {
            chassisType: Math.random() > 0.5 ? "leather" : "vegan",
            grillColor: ["Black", "Silver", "Gold"][Math.floor(Math.random() * 3)],
            padType: "Standard Pads",
            specialInstructions: j === 0 ? "Customer requested matched grain pattern" : undefined,
          },
          qualityChecklist: generateQualityChecklist(),
        })
      }

      const totalEstimatedHours = assignments.reduce((total, assignment) => {
        const [hours, minutes] = assignment.estimatedTime.split(":").map(Number)
        return total + hours + minutes / 60
      }, 0)

      schedule.push({
        date: date.toISOString().split("T")[0],
        dayName,
        isToday,
        assignments,
        totalEstimatedHours,
        status: isToday ? "in-progress" : i < 0 ? "completed" : "upcoming",
      })
    }

    return schedule
  }

  function generateQualityChecklist(): QualityCheckItem[] {
    return [
      {
        id: "qc1",
        description: "Wood grain direction matches specification",
        category: "visual",
        requiresPhoto: true,
        criticalPoint: true,
        status: "pending",
      },
      {
        id: "qc2",
        description: "Stain coverage is even across entire surface",
        category: "visual",
        requiresPhoto: true,
        criticalPoint: true,
        status: "pending",
      },
      {
        id: "qc3",
        description: "No drips or runs in finish",
        category: "visual",
        requiresPhoto: true,
        criticalPoint: false,
        status: "pending",
      },
      {
        id: "qc4",
        description: "Color matches approved sample",
        category: "visual",
        requiresPhoto: false,
        criticalPoint: true,
        status: "pending",
      },
      {
        id: "qc5",
        description: "Surface is smooth to touch",
        category: "functional",
        requiresPhoto: false,
        criticalPoint: false,
        status: "pending",
      },
    ]
  }

  // Effects
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (isTimerRunning) {
      timerInterval.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1)
      }, 1000)
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current)
      }
    }
  }, [isTimerRunning])

  // Utility functions
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "expedite":
        return "bg-theme-status-error"
      case "rush":
        return "bg-theme-status-warning"
      case "standard":
        return "bg-theme-status-info"
      default:
        return "bg-gray-600"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "visual":
        return "👁️"
      case "measurement":
        return "📏"
      case "functional":
        return "⚙️"
      case "safety":
        return "🛡️"
      default:
        return "✓"
    }
  }

  // Event handlers
  const handleWorkerSelect = (worker: Worker) => {
    setSelectedWorker(worker)
    setCurrentScreen("weekly-schedule")
  }

  const handleStartTodaysWork = () => {
    if (!selectedWorker) return

    const todaysSchedule = selectedWorker.weeklySchedule.find((day) => day.isToday)
    if (todaysSchedule && todaysSchedule.assignments.length > 0) {
      setTodaysAssignments(todaysSchedule.assignments)
      setCurrentAssignment(todaysSchedule.assignments[0])
      setCurrentAssignmentIndex(0)
      setSessionStartTime(new Date())
      setIsTimerRunning(true)
      setCurrentScreen("active-work")
    }
  }

  const handleStartQualityControl = () => {
    setCurrentScreen("quality-control")
    setCurrentCheckIndex(0)
  }

  const handleQualityCheck = (checkId: string, status: "pass" | "fail", notes?: string) => {
    if (!currentAssignment) return

    const updatedChecklist = currentAssignment.qualityChecklist.map((item) =>
      item.id === checkId ? { ...item, status, notes, timestamp: new Date() } : item,
    )

    setCurrentAssignment({
      ...currentAssignment,
      qualityChecklist: updatedChecklist,
    })

    // Auto-advance to next check or complete
    const nextIndex = currentCheckIndex + 1
    if (nextIndex < currentAssignment.qualityChecklist.length) {
      setCurrentCheckIndex(nextIndex)
    } else {
      setCurrentScreen("task-complete")
    }
  }

  const handlePhotoCapture = (checkId: string) => {
    // Simulate photo capture
    const photoUrl = `/placeholder.svg?height=300&width=300&text=Photo+${Date.now()}`
    setCapturedPhotos((prev) => [...prev, photoUrl])

    if (!currentAssignment) return

    const updatedChecklist = currentAssignment.qualityChecklist.map((item) =>
      item.id === checkId ? { ...item, photoTaken: true } : item,
    )

    setCurrentAssignment({
      ...currentAssignment,
      qualityChecklist: updatedChecklist,
    })
  }

  const handleCompleteTask = () => {
    setIsTimerRunning(false)

    // Move to next assignment if available
    const nextIndex = currentAssignmentIndex + 1
    if (nextIndex < todaysAssignments.length) {
      setCurrentAssignmentIndex(nextIndex)
      setCurrentAssignment(todaysAssignments[nextIndex])
      setCurrentCheckIndex(0)
      setQualityNotes("")
      setCapturedPhotos([])
      setElapsedTime(0)
      setCurrentScreen("active-work")
    } else {
      // All tasks complete for the day
      setElapsedTime(0)
      setCurrentCheckIndex(0)
      setQualityNotes("")
      setCapturedPhotos([])
      setCurrentAssignment(null)
      setCurrentScreen("weekly-schedule")
    }
  }

  // Status bar component
  const StatusBar = () => (
    <div className="flex items-center justify-between p-4 bg-theme-bg-primary border-b border-theme-border-primary">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {isOnline ? <Wifi className="h-5 w-5 text-theme-status-success" /> : <WifiOff className="h-5 w-5 text-theme-status-error" />}
          <span className="text-sm text-theme-text-tertiary">{isOnline ? "Online" : "Offline"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Battery className="h-5 w-5 text-theme-text-secondary" />
          <span className="text-sm text-theme-text-tertiary">{batteryLevel}%</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {selectedWorker && (
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-theme-text-secondary" />
            <span className="text-sm text-theme-text-secondary font-medium">{selectedWorker.name}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-theme-text-secondary" />
          <span className="text-sm text-theme-text-secondary font-mono">{currentTime.toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  )

  // Screen components
  const WorkerSelectionPopup = () => (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto bg-theme-brand-secondary/20 rounded-full flex items-center justify-center">
          <User className="h-12 w-12 text-theme-text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-theme-text-secondary mb-2">Welcome to ZMF Production</h1>
          <p className="text-lg text-theme-text-tertiary">Select your profile to view your schedule</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {workers.map((worker) => (
          <Card
            key={worker.id}
            className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer"
            onClick={() => handleWorkerSelect(worker)}
          >
            <CardContent className="p-6 text-center space-y-4">
              <img
                src={worker.photo || "/placeholder.svg"}
                alt={worker.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-theme-border-primary"
              />
              <div>
                <h3 className="text-xl font-semibold text-theme-text-secondary">{worker.name}</h3>
                <p className="text-sm text-theme-text-tertiary capitalize">{worker.currentShift} Shift</p>
              </div>

              <div className="flex flex-wrap gap-1 justify-center">
                {worker.skills.slice(0, 2).map((skill) => (
                  <Badge key={skill} className="bg-theme-brand-secondary text-theme-text-primary text-xs">
                    {skill}
                  </Badge>
                ))}
                {worker.skills.length > 2 && (
                  <Badge className="bg-gray-600 text-theme-text-primary text-xs">+{worker.skills.length - 2}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button onClick={onBack} className="w-full h-14 bg-gray-600 hover:bg-gray-700 text-theme-text-primary">
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Main Menu
      </Button>
    </div>
  )

  const WeeklyScheduleScreen = () => {
    if (!selectedWorker) return null

    const todaysSchedule = selectedWorker.weeklySchedule.find((day) => day.isToday)

    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 mx-auto bg-theme-brand-secondary/20 rounded-full flex items-center justify-center">
            <CalendarDays className="h-10 w-10 text-theme-text-secondary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-text-secondary">Weekly Schedule</h2>
            <p className="text-theme-text-tertiary">{selectedWorker.name}</p>
          </div>
        </div>

        <div className="space-y-4">
          {selectedWorker.weeklySchedule.map((day, index) => (
            <Card
              key={index}
              className={`${day.isToday ? "bg-theme-brand-secondary/20 border-theme-text-secondary/50" : "bg-theme-bg-secondary border-theme-border-primary"}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className={`text-lg font-semibold ${day.isToday ? "text-theme-text-secondary" : "text-theme-text-primary"}`}>
                      {day.dayName}
                      {day.isToday && <span className="ml-2 text-sm">(Today)</span>}
                    </h3>
                    <p className="text-sm text-theme-text-tertiary">{new Date(day.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${day.isToday ? "text-theme-text-secondary" : "text-theme-text-primary"}`}>
                      {day.totalEstimatedHours.toFixed(1)}h
                    </div>
                    <div className="text-sm text-theme-text-tertiary">{day.assignments.length} tasks</div>
                  </div>
                </div>

                <div className="space-y-2">
                  {day.assignments.map((assignment, assignmentIndex) => (
                    <div
                      key={assignmentIndex}
                      className="flex items-center justify-between p-2 bg-theme-bg-primary/50 rounded border border-theme-border-secondary"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-theme-text-primary font-medium">{assignment.model}</span>
                          <Badge className={`${getPriorityColor(assignment.priority)} text-theme-text-primary text-xs`}>
                            {assignment.priority}
                          </Badge>
                        </div>
                        <div className="text-sm text-theme-text-tertiary">
                          {assignment.stage} • {assignment.woodType} • {assignment.estimatedTime}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {todaysSchedule && todaysSchedule.assignments.length > 0 && (
          <Button
            onClick={handleStartTodaysWork}
            className="w-full h-16 bg-theme-status-success hover:bg-green-700 text-theme-text-primary text-lg font-semibold"
          >
            <Play className="h-6 w-6 mr-2" />
            Start Today&apos;s Work ({todaysSchedule.assignments.length} tasks)
          </Button>
        )}

        <Button
          onClick={() => setCurrentScreen("worker-selection-popup")}
          className="w-full h-14 bg-gray-600 hover:bg-gray-700 text-theme-text-primary"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Change Worker
        </Button>
      </div>
    )
  }

  const ActiveWorkScreen = () => (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="text-6xl font-bold text-theme-text-secondary font-mono">{formatTime(elapsedTime)}</div>
        <div className="text-lg text-theme-text-tertiary">Target: {currentAssignment?.estimatedTime}</div>
      </div>

      {currentAssignment && (
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-xl font-bold text-theme-text-secondary">
              {currentAssignment.model} - {currentAssignment.stage}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-theme-text-tertiary">Batch</div>
                <div className="text-theme-text-primary font-medium">{currentAssignment.batchNumber}</div>
              </div>
              <div>
                <div className="text-theme-text-tertiary">Unit</div>
                <div className="text-theme-text-primary font-medium">
                  {currentAssignment.headphoneNumber}/{currentAssignment.totalInBatch}
                </div>
              </div>
              <div>
                <div className="text-theme-text-tertiary">Wood</div>
                <div className="text-theme-text-primary font-medium">{currentAssignment.woodType}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-4">
        {isTimerRunning ? (
          <Button
            onClick={() => setIsTimerRunning(false)}
            className="flex-1 h-16 bg-theme-status-warning hover:bg-amber-700 text-theme-text-primary text-lg"
          >
            <Pause className="h-6 w-6 mr-2" />
            Pause Work
          </Button>
        ) : (
          <Button
            onClick={() => setIsTimerRunning(true)}
            className="flex-1 h-16 bg-theme-status-success hover:bg-green-700 text-theme-text-primary text-lg"
          >
            <Play className="h-6 w-6 mr-2" />
            Resume Work
          </Button>
        )}

        <Button
          onClick={handleStartQualityControl}
          className="flex-1 h-16 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary text-lg"
        >
          <CheckCircle className="h-6 w-6 mr-2" />
          Quality Check
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => setCurrentScreen("break-menu")}
          className="h-14 bg-theme-status-info hover:bg-blue-700 text-theme-text-primary"
        >
          <Clock className="h-5 w-5 mr-2" />
          Take Break
        </Button>

        <Button onClick={() => setShowIssueDialog(true)} className="h-14 bg-theme-status-error hover:bg-red-700 text-theme-text-primary">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Report Issue
        </Button>
      </div>
    </div>
  )

  const QualityControlScreen = () => {
    if (!currentAssignment) return null

    const currentCheck = currentAssignment.qualityChecklist[currentCheckIndex]
    const completedChecks = currentAssignment.qualityChecklist.filter((c) => c.status !== "pending").length
    const totalChecks = currentAssignment.qualityChecklist.length

    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-theme-text-secondary">Quality Control</h2>
          <p className="text-theme-text-tertiary">
            Check {currentCheckIndex + 1} of {totalChecks}
          </p>
          <Progress value={(completedChecks / totalChecks) * 100} className="h-2" />
        </div>

        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-start gap-3">
              <div className="text-2xl">{getCategoryIcon(currentCheck.category)}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-medium text-theme-text-primary">{currentCheck.description}</h3>
                  {currentCheck.criticalPoint && <Badge className="bg-theme-status-error text-theme-text-primary text-xs">CRITICAL</Badge>}
                </div>
                <p className="text-sm text-theme-text-tertiary capitalize">{currentCheck.category} inspection</p>
              </div>
            </div>

            {currentCheck.requiresPhoto && (
              <div className="space-y-3">
                <Button
                  onClick={() => handlePhotoCapture(currentCheck.id)}
                  className={`w-full h-16 ${
                    currentCheck.photoTaken ? "bg-theme-brand-secondary hover:bg-theme-brand-secondary/80" : "bg-theme-status-info hover:bg-blue-700"
                  } text-theme-text-primary text-lg`}
                >
                  {currentCheck.photoTaken ? (
                    <>
                      <ImageIcon className="h-6 w-6 mr-2" />
                      Photo Captured
                    </>
                  ) : (
                    <>
                      <Camera className="h-6 w-6 mr-2" />
                      Take Required Photo
                    </>
                  )}
                </Button>
              </div>
            )}

            <div className="space-y-3">
              <Textarea
                placeholder="Add notes about this check..."
                value={qualityNotes}
                onChange={(e) => setQualityNotes(e.target.value)}
                className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder-gray-400 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleQualityCheck(currentCheck.id, "pass", qualityNotes)}
                disabled={currentCheck.requiresPhoto && !currentCheck.photoTaken}
                className="h-16 bg-theme-status-success hover:bg-green-700 text-theme-text-primary text-lg disabled:opacity-50"
              >
                <CheckCircle className="h-6 w-6 mr-2" />
                Pass
              </Button>

              <Button
                onClick={() => handleQualityCheck(currentCheck.id, "fail", qualityNotes)}
                className="h-16 bg-theme-status-error hover:bg-red-700 text-theme-text-primary text-lg"
              >
                <XCircle className="h-6 w-6 mr-2" />
                Fail
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button
            onClick={() => setCurrentScreen("active-work")}
            className="flex-1 h-14 bg-gray-600 hover:bg-gray-700 text-theme-text-primary"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Work
          </Button>

          {currentCheckIndex > 0 && (
            <Button
              onClick={() => setCurrentCheckIndex((prev) => prev - 1)}
              className="h-14 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary px-6"
            >
              Previous
            </Button>
          )}
        </div>
      </div>
    )
  }

  const TaskCompleteScreen = () => {
    const passedChecks = currentAssignment?.qualityChecklist.filter((c) => c.status === "pass").length || 0
    const totalChecks = currentAssignment?.qualityChecklist.length || 0
    const qualityScore = Math.round((passedChecks / totalChecks) * 100)

    return (
      <div className="p-6 space-y-6">
        <div className="text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-theme-status-success/20 rounded-full flex items-center justify-center">
            <Award className="h-12 w-12 text-theme-status-success" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-theme-text-secondary">Task Complete!</h2>
            <p className="text-theme-text-tertiary">Excellent work on this stage</p>
          </div>
        </div>

        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardContent className="p-6 space-y-4">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold text-theme-status-success">{qualityScore}%</div>
              <div className="text-sm text-theme-text-tertiary">Quality Score</div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-theme-text-secondary">{formatTime(elapsedTime)}</div>
                <div className="text-sm text-theme-text-tertiary">Time Elapsed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-theme-text-secondary">
                  {passedChecks}/{totalChecks}
                </div>
                <div className="text-sm text-theme-text-tertiary">Checks Passed</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-theme-text-tertiary">Stage: {currentAssignment?.stage}</span>
                <span className="text-theme-status-success">✓ Complete</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-theme-text-tertiary">Batch: {currentAssignment?.batchNumber}</span>
                <span className="text-theme-text-secondary">
                  Unit {currentAssignment?.headphoneNumber}/{currentAssignment?.totalInBatch}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button
            onClick={handleCompleteTask}
            className="w-full h-16 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary text-lg font-semibold"
          >
            <Zap className="h-6 w-6 mr-2" />
            Complete & Get Next Task
          </Button>

          <Button
            onClick={() => setCurrentScreen("break-menu")}
            className="w-full h-14 bg-theme-status-info hover:bg-blue-700 text-theme-text-primary"
          >
            <Clock className="h-5 w-5 mr-2" />
            Take a Break
          </Button>
        </div>
      </div>
    )
  }

  const BreakMenuScreen = () => (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 mx-auto bg-theme-status-info/20 rounded-full flex items-center justify-center">
          <Clock className="h-10 w-10 text-theme-status-info" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-theme-text-secondary">Break Time</h2>
          <p className="text-theme-text-tertiary">Take care of yourself</p>
        </div>
      </div>

      <div className="space-y-4">
        <Button className="w-full h-16 bg-theme-status-info hover:bg-blue-700 text-theme-text-primary text-lg">
          <Clock className="h-6 w-6 mr-2" />
          15 Minute Break
        </Button>

        <Button className="w-full h-16 bg-theme-status-success hover:bg-green-700 text-theme-text-primary text-lg">
          <Clock className="h-6 w-6 mr-2" />
          30 Minute Lunch
        </Button>

        <Button className="w-full h-16 bg-theme-status-warning hover:bg-amber-700 text-theme-text-primary text-lg">
          <Clock className="h-6 w-6 mr-2" />
          End of Shift
        </Button>
      </div>

      <Button
        onClick={() => setCurrentScreen("active-work")}
        className="w-full h-14 bg-gray-600 hover:bg-gray-700 text-theme-text-primary"
      >
        <ArrowLeft className="h-5 w-5 mr-2" />
        Back to Work
      </Button>
    </div>
  )

  // Main render
  return (
    <div className="min-h-screen bg-gradient-to-b from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary max-w-md mx-auto">
      <StatusBar />

      <main className="pb-6">
        {currentScreen === "worker-selection-popup" && <WorkerSelectionPopup />}
        {currentScreen === "weekly-schedule" && <WeeklyScheduleScreen />}
        {currentScreen === "active-work" && <ActiveWorkScreen />}
        {currentScreen === "quality-control" && <QualityControlScreen />}
        {currentScreen === "task-complete" && <TaskCompleteScreen />}
        {currentScreen === "break-menu" && <BreakMenuScreen />}
      </main>

      {/* Issue Report Dialog */}
      <Dialog open={showIssueDialog} onOpenChange={setShowIssueDialog}>
        <DialogContent className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
          <DialogHeader>
            <DialogTitle className="text-theme-text-secondary">Report Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Describe the issue..."
              className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder-gray-400"
              rows={4}
            />
            <div className="grid grid-cols-2 gap-2">
              <Button className="bg-theme-status-error hover:bg-red-700 text-theme-text-primary">Quality Issue</Button>
              <Button className="bg-theme-status-warning hover:bg-amber-700 text-theme-text-primary">Equipment Issue</Button>
              <Button className="bg-theme-status-info hover:bg-blue-700 text-theme-text-primary">Material Issue</Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-theme-text-primary">Other Issue</Button>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowIssueDialog(false)}
              className="border-theme-border-primary text-theme-text-primary hover:bg-theme-brand-secondary/20"
            >
              Cancel
            </Button>
            <Button onClick={() => setShowIssueDialog(false)} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
