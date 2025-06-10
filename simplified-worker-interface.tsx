"use client"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
  User,
  Clock,
  Wifi,
  Battery,
  ArrowLeft,
  Calendar,
  Settings,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  CheckSquare,
  Square,
  MessageSquare,
} from "lucide-react"
import type { QCChecklistItem } from "./types/quality-control"
import { QC_CHECKLISTS } from "./data/qc-checklists"
import { useReportedIssues } from "./hooks/use-reported-issues"

// Types
interface Worker {
  id: string
  name: string
  photo: string
  department: string
  shift: "Day" | "Evening" | "Night"
  skills: string[]
  weeklyHours: number
  todayProgress: {
    completed: number
    total: number
    hoursWorked: number
  }
  primarySkill?: string
  weeklyCapacity?: number
}

interface WorkerAssignment {
  id: string
  date: string
  day: string
  batchNumber: string
  model: string
  stage: string
  hours: number
  priority: "normal" | "high" | "urgent"
  status: "scheduled" | "in-progress" | "completed"
}

interface QCApproval {
  status: "approved" | "approved-but-fixed" | "rework-required"
  issueDescription?: string
  timestamp: Date
  worker: string
}

interface SimplifiedWorkerInterfaceProps {
  onBack: () => void
}

type ViewState = "worker-selection" | "my-assignments" | "assignment-work"

// Report Issue Modal Component
const ReportIssueModal = ({
  isOpen,
  onClose,
  workerName,
  assignment,
}: {
  isOpen: boolean
  onClose: () => void
  workerName: string
  assignment?: WorkerAssignment
}) => {
  const [issueText, setIssueText] = useState("")
  const [issueType, setIssueType] = useState<"quality" | "equipment" | "material" | "safety" | "other">("quality")
  const { addIssue } = useReportedIssues()

  const handleSubmit = () => {
    if (!issueText.trim()) {
      alert("Please describe the issue")
      return
    }

    addIssue({
      id: `issue-${Date.now()}`,
      workerName,
      stage: assignment?.stage || "Unknown",
      batchNumber: assignment?.batchNumber || "N/A",
      model: assignment?.model || "N/A",
      issueType,
      description: issueText,
      timestamp: new Date(),
      status: "open",
      priority: issueType === "safety" ? "critical" : issueType === "quality" ? "high" : "medium",
    })

    setIssueText("")
    setIssueType("quality")
    onClose()
    alert("Issue reported successfully!")
  }

  const issueTypeColors = {
    quality: "bg-red-600",
    equipment: "bg-amber-600",
    material: "bg-blue-600",
    safety: "bg-purple-600",
    other: "bg-gray-600",
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1a0d08] border-[#8B4513]/30 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-[#d4a574] flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Report Issue
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {assignment && (
            <div className="bg-[#0a0a0a] p-3 rounded border border-[#8B4513]/20">
              <div className="text-sm text-gray-400">Current Assignment:</div>
              <div className="text-white font-medium">
                {assignment.model} - {assignment.stage}
              </div>
              <div className="text-sm text-gray-400">{assignment.batchNumber}</div>
            </div>
          )}

          <div className="space-y-3">
            <label className="text-sm font-medium text-[#d4a574]">Issue Type:</label>
            <div className="grid grid-cols-2 gap-2">
              {(["quality", "equipment", "material", "safety", "other"] as const).map((type) => (
                <Button
                  key={type}
                  onClick={() => setIssueType(type)}
                  className={`h-10 text-sm ${
                    issueType === type
                      ? `${issueTypeColors[type]} text-white`
                      : "bg-gray-600 hover:bg-gray-700 text-white"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#d4a574]">Issue Description:</label>
            <Textarea
              value={issueText}
              onChange={(e) => setIssueText(e.target.value)}
              placeholder="Describe the issue in detail..."
              className="bg-[#0a0a0a] border-[#8B4513]/30 text-white placeholder-gray-400 min-h-[120px]"
              rows={5}
            />
          </div>

          <div className="flex justify-between gap-3">
            <Button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="flex-1 bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// QC Checklist Modal Component
const QCChecklistModal = ({
  isOpen,
  onClose,
  stage,
  batchInfo,
  orderInfo,
  workTime = 0,
  isPreWork,
  onComplete,
}: {
  isOpen: boolean
  onClose: () => void
  stage: string
  batchInfo: {
    batchNumber: string
    unitNumber?: number
    totalUnits: number
  }
  orderInfo: {
    orderNumber: string
    model: string
    woodType: string
  }
  workTime?: number
  isPreWork: boolean
  onComplete: (approval: QCApproval, checklist: QCChecklistItem[]) => void
}) => {
  const [checklist, setChecklist] = useState<QCChecklistItem[]>(() => {
    const stageChecklist = QC_CHECKLISTS[stage]
    return stageChecklist ? [...stageChecklist.items] : []
  })
  const [approvalStatus, setApprovalStatus] = useState<"approved" | "approved-but-fixed" | "rework-required" | "">("")
  const [issueDescription, setIssueDescription] = useState("")

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setChecklist((prev) => prev.map((item) => (item.id === itemId ? { ...item, checked } : item)))
  }

  const handleSelectAll = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, checked: true })))
  }

  const handleClearAll = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, checked: false })))
  }

  const allItemsChecked = checklist.every((item) => item.checked)
  const criticalItemsChecked = checklist.filter((item) => item.critical).every((item) => item.checked)

  const handleComplete = () => {
    if (!isPreWork && !approvalStatus) {
      alert("Please select an approval status")
      return
    }

    if (approvalStatus === "approved-but-fixed" && !issueDescription.trim()) {
      alert("Please describe what was fixed")
      return
    }

    if (isPreWork && !allItemsChecked) {
      alert("All pre-work items must be checked before beginning work")
      return
    }

    const approval: QCApproval = {
      status: isPreWork ? "approved" : (approvalStatus as any),
      issueDescription: approvalStatus === "approved-but-fixed" ? issueDescription : undefined,
      timestamp: new Date(),
      worker: "Current Worker",
    }

    onComplete(approval, checklist)
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} minutes`
  }

  const groupedItems = checklist.reduce(
    (groups, item) => {
      const category = item.category || "General"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    },
    {} as Record<string, QCChecklistItem[]>,
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a0d08] border-[#8B4513]/50 text-white">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            {isPreWork ? (
              <Search className="h-8 w-8 text-[#d4a574]" />
            ) : (
              <CheckCircle className="h-8 w-8 text-[#d4a574]" />
            )}
            <DialogTitle className="text-3xl font-bold text-[#d4a574]">
              {isPreWork ? `${stage} Pre-Work Quality Check` : `${stage} Post-Work Quality Verification`}
            </DialogTitle>
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg text-gray-300">
              {isPreWork ? "(Must complete before starting)" : `Work completed in: ${formatTime(workTime)}`}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-[#d4a574] font-medium">{batchInfo.batchNumber}</span>
              <span className="text-gray-400">•</span>
              {batchInfo.unitNumber && (
                <>
                  <span className="text-[#d4a574] font-medium">Unit {batchInfo.unitNumber}</span>
                  <span className="text-gray-400">•</span>
                </>
              )}
              <span className="text-[#d4a574] font-medium">{orderInfo.model}</span>
              {orderInfo.woodType !== "Mixed" && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-[#d4a574] font-medium">{orderInfo.woodType}</span>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Bulk Actions */}
          <div className="flex justify-center gap-4">
            <Button onClick={handleSelectAll} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white px-6 py-2">
              <CheckSquare className="h-4 w-4 mr-2" />
              SELECT ALL
            </Button>
            <Button onClick={handleClearAll} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2">
              <Square className="h-4 w-4 mr-2" />
              CLEAR ALL
            </Button>
          </div>

          {/* Checklist Items */}
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category} className="bg-[#0a0a0a] border-[#8B4513]/30">
                <CardContent className="p-6">
                  {category !== "General" && <h3 className="text-xl font-bold text-[#d4a574] mb-4">{category}</h3>}

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#1a0d08] transition-colors"
                      >
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                          className="mt-1 h-6 w-6 border-[#8B4513] data-[state=checked]:bg-[#8B4513] data-[state=checked]:border-[#8B4513]"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={item.id}
                            className={`text-lg cursor-pointer ${item.checked ? "text-white" : "text-gray-300"} ${item.critical ? "font-medium" : ""}`}
                          >
                            {item.description}
                          </label>
                          {item.critical && <Badge className="ml-2 bg-red-600 text-white text-xs">CRITICAL</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pre-work Warning */}
          {isPreWork && (
            <Card className="bg-amber-900/20 border-amber-600/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                  <p className="text-amber-100 font-medium">All items must be checked to begin work</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Assessment (Post-work only) */}
          {!isPreWork && (
            <Card className="bg-[#0a0a0a] border-[#8B4513]/30">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-[#d4a574]">Quality Assessment</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-[#8B4513]/50 cursor-pointer">
                    <input
                      type="radio"
                      name="approval"
                      value="approved"
                      checked={approvalStatus === "approved"}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="h-5 w-5 text-[#8B4513]"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-lg text-white">APPROVED - Ready for next stage</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-[#8B4513]/50 cursor-pointer">
                    <input
                      type="radio"
                      name="approval"
                      value="approved-but-fixed"
                      checked={approvalStatus === "approved-but-fixed"}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="h-5 w-5 text-[#8B4513]"
                    />
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                      <span className="text-lg text-white">APPROVED BUT FIXED - Issues corrected</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-[#8B4513]/50 cursor-pointer">
                    <input
                      type="radio"
                      name="approval"
                      value="rework-required"
                      checked={approvalStatus === "rework-required"}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="h-5 w-5 text-[#8B4513]"
                    />
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <span className="text-lg text-white">REWORK REQUIRED - Send back for correction</span>
                    </div>
                  </label>
                </div>

                {approvalStatus === "approved-but-fixed" && (
                  <div className="space-y-2">
                    <label className="text-lg font-medium text-[#d4a574]">Issue Description (required):</label>
                    <Textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Describe what was fixed..."
                      className="bg-[#1a0d08] border-[#8B4513]/30 text-white placeholder-gray-400 min-h-[100px] text-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button onClick={onClose} className="h-14 bg-gray-600 hover:bg-gray-700 text-white text-lg px-8">
              Cancel
            </Button>

            <div className="flex gap-4">
              {isPreWork ? (
                <>
                  <Button
                    onClick={handleComplete}
                    disabled={!allItemsChecked}
                    className="h-14 bg-[#8B4513] hover:bg-[#8B4513]/80 text-white text-lg px-8 disabled:opacity-50"
                  >
                    <CheckCircle className="h-6 w-6 mr-2" />
                    APPROVED - BEGIN WORK
                  </Button>
                  <Button className="h-14 bg-red-600 hover:bg-red-700 text-white text-lg px-8">
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    REPORT MAJOR ISSUE
                  </Button>
                </>
              ) : (
                <>
                  <Button className="h-14 bg-amber-600 hover:bg-amber-700 text-white text-lg px-8">
                    NEED SUPERVISOR
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={!approvalStatus || (approvalStatus === "approved-but-fixed" && !issueDescription.trim())}
                    className="h-14 bg-[#8B4513] hover:bg-[#8B4513]/80 text-white text-lg px-8 disabled:opacity-50"
                  >
                    <CheckCircle className="h-6 w-6 mr-2" />
                    COMPLETE QC
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// My Assignments View Component
const MyAssignmentsView = ({
  selectedWorker,
  onAssignmentSelect,
}: {
  selectedWorker: Worker | null
  onAssignmentSelect: (assignment: WorkerAssignment) => void
}) => {
  if (!selectedWorker) return null

  // Mock assignment data for the worker
  const workerAssignments = [
    {
      id: "wa1",
      date: "2024-06-10",
      day: "Monday",
      batchNumber: "BATCH-2024-001",
      model: "Verite Closed",
      stage: "Sanding",
      hours: 6,
      priority: "normal" as const,
      status: "scheduled" as const,
    },
    {
      id: "wa2",
      date: "2024-06-11",
      day: "Tuesday",
      batchNumber: "BATCH-2024-002",
      model: "Caldera Open",
      stage: "Finishing",
      hours: 8,
      priority: "high" as const,
      status: "scheduled" as const,
    },
    {
      id: "wa3",
      date: "2024-06-12",
      day: "Wednesday",
      batchNumber: "BATCH-2024-003",
      model: "Auteur",
      stage: "Intake",
      hours: 4,
      priority: "normal" as const,
      status: "scheduled" as const,
    },
  ]

  const getStageColor = (stage: string) => {
    const stageColors = {
      Intake: "bg-blue-600",
      Sanding: "bg-yellow-600",
      Finishing: "bg-purple-600",
      Assembly: "bg-green-600",
      "Acoustic QC": "bg-red-600",
      Shipping: "bg-gray-600",
    }
    return stageColors[stage as keyof typeof stageColors] || "bg-gray-600"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-600"
      case "high":
        return "bg-amber-600"
      case "normal":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  const totalWeeklyHours = workerAssignments.reduce((sum, assignment) => sum + assignment.hours, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-[#2a1810] border-[#8B4513]/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedWorker.name}</h2>
              <p className="text-gray-300">Weekly Assignment Schedule</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#d4a574]">{totalWeeklyHours}h</div>
              <div className="text-sm text-gray-400">Total Hours</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Department</div>
              <div className="text-white font-medium">{selectedWorker.department}</div>
            </div>
            <div>
              <div className="text-gray-400">Primary Skill</div>
              <div className="text-white font-medium">{selectedWorker.primarySkill}</div>
            </div>
            <div>
              <div className="text-gray-400">This Week</div>
              <div className="text-white font-medium">{workerAssignments.length} assignments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#d4a574] flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Monday - Saturday Schedule
        </h3>

        {workerAssignments.map((assignment) => (
          <Card
            key={assignment.id}
            className="bg-[#0a0a0a] border-l-4 border-l-[#8B4513] hover:bg-[#1a0d08] transition-colors cursor-pointer"
            onClick={() => onAssignmentSelect(assignment)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-center min-w-[80px]">
                    <div className="text-lg font-bold text-[#d4a574]">{assignment.day}</div>
                    <div className="text-xs text-gray-400">{new Date(assignment.date).toLocaleDateString()}</div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{assignment.model}</span>
                      <Badge className={`${getStageColor(assignment.stage)} text-white border-none text-xs`}>
                        {assignment.stage}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-400">{assignment.batchNumber}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-lg font-bold text-[#d4a574]">{assignment.hours}h</div>
                    <div className="text-xs text-gray-400">Assigned</div>
                  </div>
                  <Badge className={`${getPriorityColor(assignment.priority)} text-white`}>
                    {assignment.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Assignment Work View Component
const AssignmentWorkView = ({
  assignment,
  onBack,
  onGoToFront,
  workerName,
}: {
  assignment: WorkerAssignment
  onBack: () => void
  onGoToFront: () => void
  workerName: string
}) => {
  const [showPreWorkQCModal, setShowPreWorkQCModal] = useState(false)
  const [showSOPModal, setShowSOPModal] = useState(false)
  const [showPostWorkQCModal, setShowPostWorkQCModal] = useState(false)
  const [showReportIssueModal, setShowReportIssueModal] = useState(false)

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "urgent":
        return "bg-red-600"
      case "high":
        return "bg-amber-600"
      case "normal":
        return "bg-blue-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStageColor = (stage: string) => {
    const stageColors = {
      Intake: "bg-blue-600",
      Sanding: "bg-yellow-600",
      Finishing: "bg-purple-600",
      Assembly: "bg-green-600",
      "Acoustic QC": "bg-red-600",
      Shipping: "bg-gray-600",
    }
    return stageColors[stage as keyof typeof stageColors] || "bg-gray-600"
  }

  const handlePreWorkQCComplete = (approval: QCApproval, checklist: QCChecklistItem[]) => {
    console.log("Pre-work QC completed:", approval, checklist)
    setShowPreWorkQCModal(false)
    // Stay on the work page after pre-work QC
  }

  const handlePostWorkQCComplete = (approval: QCApproval, checklist: QCChecklistItem[]) => {
    console.log("Post-work QC completed:", approval, checklist)
    setShowPostWorkQCModal(false)

    if (approval.status === "rework-required") {
      alert("Rework required - please correct issues and try again")
      return
    }

    // Go to front screen after successful post-work QC
    onGoToFront()
  }

  // Mock batch and order info
  const batchInfo = {
    batchNumber: assignment.batchNumber,
    unitNumber: 1,
    totalUnits: 4,
  }

  const orderInfo = {
    orderNumber: "ZMF-2024-1000",
    model: assignment.model,
    woodType: "Mixed",
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <Card className="bg-[#2a1810] border-[#8B4513]/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-2xl font-bold text-white">{assignment.model}</h2>
              <div className="flex items-center gap-2">
                <Badge className={`${getStageColor(assignment.stage)} text-white border-none`}>
                  {assignment.stage}
                </Badge>
                <span className="text-gray-300">{assignment.batchNumber}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-[#d4a574] font-mono">00:00</div>
              <div className="text-sm text-gray-400">Time Elapsed</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Day</div>
              <div className="text-white font-medium">{assignment.day}</div>
            </div>
            <div>
              <div className="text-gray-400">Estimated Hours</div>
              <div className="text-white font-medium">{assignment.hours}h</div>
            </div>
            <div>
              <div className="text-gray-400">Priority</div>
              <Badge className={`${getPriorityColor(assignment.priority)} text-white`}>
                {assignment.priority.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={() => setShowPreWorkQCModal(true)}
          className="h-14 bg-blue-600 hover:bg-blue-700 text-white text-lg"
        >
          Pre-work QC
        </Button>
        <Button
          onClick={() => setShowSOPModal(true)}
          className="h-14 bg-indigo-600 hover:bg-indigo-700 text-white text-lg"
        >
          View SOP
        </Button>
      </div>

      {/* Timer Controls */}
      <div className="flex justify-between">
        <Button className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white text-lg mr-2">Start Work</Button>
        <Button className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white text-lg">Stop Timer</Button>
      </div>

      {/* Report Issue Button */}
      <Button
        onClick={() => setShowReportIssueModal(true)}
        className="w-full h-14 bg-orange-600 hover:bg-orange-700 text-white text-lg"
      >
        <MessageSquare className="h-6 w-6 mr-2" />
        Report Issue
      </Button>

      {/* Model Specifications */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-[#d4a574] flex items-center">
          <Settings className="h-5 w-5 mr-2" />
          Model Specifications
        </h3>

        <Card className="bg-[#0a0a0a] border-[#8B4513]/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-bold text-[#d4a574]">Verite Closed</h4>
              <Badge className="bg-gray-600 text-white">50mm Be2</Badge>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm mb-2">
              <div>
                <div className="text-gray-400">Impedance</div>
                <div className="text-white font-medium">300Ω</div>
              </div>
              <div>
                <div className="text-gray-400">Weight</div>
                <div className="text-white font-medium">415g</div>
              </div>
              <div>
                <div className="text-gray-400">Wood Options</div>
                <div className="text-white font-medium">4 types</div>
              </div>
            </div>
            <div className="text-xs text-gray-400">Closed-back design, balanced sound signature</div>
            <div className="flex flex-wrap gap-1 mt-2">
              <Badge className="bg-[#8B4513]/30 text-[#d4a574] text-xs">Sapele</Badge>
              <Badge className="bg-[#8B4513]/30 text-[#d4a574] text-xs">Walnut</Badge>
              <Badge className="bg-[#8B4513]/30 text-[#d4a574] text-xs">Cherry</Badge>
              <Badge className="bg-[#8B4513]/30 text-[#d4a574] text-xs">Padauk</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Post Work QC Button */}
      <Button
        onClick={() => setShowPostWorkQCModal(true)}
        className="w-full h-14 bg-amber-600 hover:bg-amber-700 text-white text-lg"
      >
        Post Work QC
      </Button>

      {/* Back Button */}
      <Button onClick={onBack} className="w-full h-14 bg-gray-600 hover:bg-gray-700 text-white text-lg">
        <ArrowLeft className="h-6 w-6 mr-2" />
        Back to Assignments
      </Button>

      {/* Modals */}
      <QCChecklistModal
        isOpen={showPreWorkQCModal}
        onClose={() => setShowPreWorkQCModal(false)}
        stage={assignment.stage}
        batchInfo={batchInfo}
        orderInfo={orderInfo}
        workTime={0}
        isPreWork={true}
        onComplete={handlePreWorkQCComplete}
      />

      <QCChecklistModal
        isOpen={showPostWorkQCModal}
        onClose={() => setShowPostWorkQCModal(false)}
        stage={assignment.stage}
        batchInfo={batchInfo}
        orderInfo={orderInfo}
        workTime={3600} // Mock 1 hour of work time
        isPreWork={false}
        onComplete={handlePostWorkQCComplete}
      />

      <ReportIssueModal
        isOpen={showReportIssueModal}
        onClose={() => setShowReportIssueModal(false)}
        workerName={workerName}
        assignment={assignment}
      />

      {/* SOP Modal */}
      {showSOPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a0d08] border-[#8B4513]/30 p-6 rounded-lg shadow-lg space-y-4 w-96">
            <h3 className="text-xl font-semibold text-[#d4a574]">Standard Operating Procedures</h3>
            <div className="space-y-3 text-gray-300">
              <div>
                <h4 className="font-semibold text-white">{assignment.stage} Stage SOP:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Follow all safety protocols</li>
                  <li>Inspect materials before starting</li>
                  <li>Document any issues immediately</li>
                </ul>
              </div>
            </div>
            <Button onClick={() => setShowSOPModal(false)} className="w-full bg-gray-600 hover:bg-gray-700 text-white">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SimplifiedWorkerInterface({ onBack }: SimplifiedWorkerInterfaceProps) {
  // Minimal state
  const [currentView, setCurrentView] = useState<ViewState>("worker-selection")
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [selectedAssignment, setSelectedAssignment] = useState<WorkerAssignment | null>(null)

  // Mock data - reduced set
  const workers: Worker[] = [
    {
      id: "w1",
      name: "Tony S.",
      photo: "/placeholder.svg?height=100&width=100&text=TS",
      department: "Intake & Sanding",
      shift: "Day",
      skills: ["Cup Intake", "Robot Sanding", "Quality Control"],
      weeklyHours: 32.5,
      todayProgress: { completed: 6, total: 8, hoursWorked: 5.2 },
      primarySkill: "Cup Intake",
      weeklyCapacity: 40,
    },
    {
      id: "w2",
      name: "Jake M.",
      photo: "/placeholder.svg?height=100&width=100&text=JM",
      department: "Sanding & Assembly",
      shift: "Day",
      skills: ["Cup Sanding", "Final Assembly", "Testing"],
      weeklyHours: 35.0,
      todayProgress: { completed: 4, total: 6, hoursWorked: 6.8 },
      primarySkill: "Cup Sanding",
      weeklyCapacity: 40,
    },
    {
      id: "w3",
      name: "Kevin R.",
      photo: "/placeholder.svg?height=100&width=100&text=KR",
      department: "Finishing",
      shift: "Day",
      skills: ["Wood Finishing", "Staining", "Special Coatings"],
      weeklyHours: 38.5,
      todayProgress: { completed: 3, total: 4, hoursWorked: 7.1 },
      primarySkill: "Wood Finishing",
      weeklyCapacity: 40,
    },
  ]

  // Event handlers
  const handleWorkerSelect = (worker: Worker) => {
    setSelectedWorker(worker)
    setCurrentView("my-assignments")
  }

  const handleAssignmentSelect = (assignment: WorkerAssignment) => {
    setSelectedAssignment(assignment)
    setCurrentView("assignment-work")
  }

  const handleGoToFront = () => {
    setCurrentView("worker-selection")
    setSelectedWorker(null)
    setSelectedAssignment(null)
  }

  // Status Bar Component - static
  const StatusBar = () => (
    <div className="flex items-center justify-between p-4 bg-[#0a0a0a] border-b border-[#8B4513]/30">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Wifi className="h-5 w-5 text-green-500" />
          <span className="text-sm text-gray-400">Online</span>
        </div>
        <div className="flex items-center gap-2">
          <Battery className="h-5 w-5 text-[#d4a574]" />
          <span className="text-sm text-gray-400">92%</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {selectedWorker && (
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-[#d4a574]" />
            <span className="text-sm text-[#d4a574] font-medium">{selectedWorker.name}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#d4a574]" />
          <span className="text-sm text-[#d4a574] font-mono">10:30:45</span>
        </div>
      </div>
    </div>
  )

  // Worker Selection View
  const WorkerSelectionView = () => (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="w-24 h-24 mx-auto bg-[#8B4513]/20 rounded-full flex items-center justify-center">
          <User className="h-12 w-12 text-[#d4a574]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#d4a574]">Select Worker</h1>
          <p className="text-lg text-gray-300">Choose your name to start working</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {workers.map((worker) => (
          <Button
            key={worker.id}
            onClick={() => handleWorkerSelect(worker)}
            className="h-20 bg-[#1a0d08] hover:bg-[#8B4513]/30 border border-[#8B4513]/30 hover:border-[#d4a574]/50 text-white flex flex-col items-center justify-center p-3 transition-all"
          >
            <div className="w-8 h-8 bg-[#8B4513]/20 rounded-full flex items-center justify-center mb-1">
              <User className="h-4 w-4 text-[#d4a574]" />
            </div>
            <div className="text-sm font-medium text-center leading-tight">{worker.name}</div>
            <div className="text-xs text-gray-400 text-center">{worker.department}</div>
          </Button>
        ))}
      </div>

      <Button onClick={onBack} className="w-full h-14 bg-gray-600 hover:bg-gray-700 text-white text-lg">
        <ArrowLeft className="h-6 w-6 mr-2" />
        Back to Main Menu
      </Button>
    </div>
  )

  // Render Views
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <StatusBar />

      {currentView === "worker-selection" && <WorkerSelectionView />}
      {currentView === "my-assignments" && selectedWorker && (
        <MyAssignmentsView selectedWorker={selectedWorker} onAssignmentSelect={handleAssignmentSelect} />
      )}
      {currentView === "assignment-work" && selectedAssignment && selectedWorker && (
        <AssignmentWorkView
          assignment={selectedAssignment}
          onBack={() => setCurrentView("my-assignments")}
          onGoToFront={handleGoToFront}
          workerName={selectedWorker.name}
        />
      )}
    </div>
  )
}
