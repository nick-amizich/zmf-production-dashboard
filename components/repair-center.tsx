"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Search,
  Eye,
  AlertTriangle,
  Plus,
  ArrowLeft,
  Home,
  Camera,
  CheckCircle,
  MessageSquare,
  Package,
  Wrench,
  Timer,
} from "lucide-react"

interface RepairOrder {
  id: string
  repairNumber: string
  customerName: string
  model: string
  woodType: string
  originalOrderNumber?: string
  status: "intake" | "diagnosed" | "approved" | "in_progress" | "testing" | "completed" | "shipped"
  priority: "standard" | "rush"
  repairType:
    | "production-rework"
    | "finishing-rework"
    | "acoustic-issues"
    | "wood-damage"
    | "hardware-issues"
    | "driver-problems"
  repairSource: "customer" | "internal"
  receivedDate: string
  assignedTo?: string
  location?: string
  timeSpent?: number
  estimatedCost?: number
  customerNote?: string
  warrantyStatus: "in-warranty" | "out-of-warranty" | "extended"
  complexity: "simple" | "moderate" | "complex" | "specialized"
  isFirstTime?: boolean
  customerApproved?: boolean
  orderType?: "warranty" | "paid"
  partsNeeded?: string[]
  photosBefore?: string[]
  photosAfter?: string[]
}

interface RepairCenterProps {
  onBack: () => void
}

// Sample ZMF repair data
const sampleRepairs: RepairOrder[] = [
  {
    id: "1",
    repairNumber: "R-2024-001",
    customerName: "Marcus Thompson",
    model: "Verite Closed",
    woodType: "Sapele",
    originalOrderNumber: "ZMF-2024-0145",
    status: "in_progress",
    priority: "rush",
    repairType: "driver-problems",
    repairSource: "internal",
    receivedDate: "2024-01-15",
    assignedTo: "Matt Wilson",
    location: "QC Station",
    timeSpent: 120,
    estimatedCost: 85.0,
    customerNote: "Left driver producing distortion at high volumes",
    warrantyStatus: "in-warranty",
    complexity: "moderate",
    isFirstTime: false,
    customerApproved: true,
    orderType: "warranty",
    partsNeeded: ["Driver - Left", "Damping Material"],
  },
  {
    id: "2",
    repairNumber: "R-2024-002",
    customerName: "Sarah Chen",
    model: "Caldera Open",
    woodType: "Cocobolo",
    originalOrderNumber: "ZMF-2024-0132",
    status: "diagnosed",
    priority: "standard",
    repairType: "finishing-rework",
    repairSource: "customer",
    receivedDate: "2024-01-14",
    assignedTo: "Kevin Chen",
    location: "Finishing Station",
    timeSpent: 45,
    estimatedCost: 125.0,
    customerNote: "Finish has developed small crack near the right cup edge",
    warrantyStatus: "out-of-warranty",
    complexity: "complex",
    isFirstTime: true,
    customerApproved: false,
    orderType: "paid",
    partsNeeded: ["Cocobolo Stain", "Clear Coat"],
  },
  {
    id: "3",
    repairNumber: "R-2024-003",
    customerName: "David Rodriguez",
    model: "Auteur",
    woodType: "Cherry",
    status: "intake",
    priority: "standard",
    repairType: "hardware-issues",
    repairSource: "customer",
    receivedDate: "2024-01-16",
    location: "Assembly Bench",
    timeSpent: 0,
    estimatedCost: 45.0,
    customerNote: "Headband adjustment mechanism feels loose",
    warrantyStatus: "extended",
    complexity: "simple",
    isFirstTime: false,
    customerApproved: true,
    orderType: "warranty",
    partsNeeded: ["Headband Hardware", "Adjustment Screws"],
  },
]

const zmfStaff = [
  "Tony Martinez",
  "Stephen Wilson",
  "Jake Thompson",
  "Keith Johnson",
  "Kevin Chen",
  "Matt Wilson",
  "Landon Davis",
  "Laura Davis",
  "Atticus Brown",
  "Maggie Smith",
  "Bevin Taylor",
  "Taryn Anderson",
  "Lane Garcia",
  "Anna Martinez",
]

export default function RepairCenter({ onBack }: RepairCenterProps) {
  const [repairs] = useState<RepairOrder[]>(sampleRepairs)
  const [selectedRepair, setSelectedRepair] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<"dashboard" | "repair-work">("dashboard")
  const [workingRepair, setWorkingRepair] = useState<RepairOrder | null>(null)

  // Dialog states
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false)
  const [customerNoteDialogOpen, setCustomerNoteDialogOpen] = useState(false)
  const [createRepairDialogOpen, setCreateRepairDialogOpen] = useState(false)

  // Form states
  const [newAssignee, setNewAssignee] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [newPriority, setNewPriority] = useState<"standard" | "rush">("standard")
  const [selectedCustomerNote, setSelectedCustomerNote] = useState("")

  // Filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [repairTypeFilter, setRepairTypeFilter] = useState("all")
  const [repairSourceFilter, setRepairSourceFilter] = useState<"all" | "customer" | "internal">("all")

  // Timer state for repair work
  const [isWorking, setIsWorking] = useState(false)
  const [workTime, setWorkTime] = useState(0)

  const renderBreadcrumb = () => {
    const paths = ["Production Management", "Repair Center"]

    if (currentView === "repair-work" && workingRepair) {
      paths.push(`Working on ${workingRepair.repairNumber}`)
    }

    return (
      <div className="flex items-center gap-2 text-sm text-theme-text-tertiary mb-6">
        <Button onClick={onBack} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary h-10 px-4">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
        <span>→</span>
        {paths.map((path, index) => (
          <span key={index} className={index === paths.length - 1 ? "text-theme-text-secondary" : ""}>
            {path}
            {index < paths.length - 1 && <span className="mx-2">→</span>}
          </span>
        ))}
      </div>
    )
  }

  // Filter repairs
  const filteredRepairs = useMemo(() => {
    return repairs.filter((repair) => {
      const matchesSearch =
        searchTerm === "" ||
        repair.repairNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repair.originalOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || repair.status === statusFilter
      const matchesPriority = priorityFilter === "all" || repair.priority === priorityFilter
      const matchesRepairType = repairTypeFilter === "all" || repair.repairType === repairTypeFilter
      const matchesRepairSource = repairSourceFilter === "all" || repair.repairSource === repairSourceFilter

      return matchesSearch && matchesStatus && matchesPriority && matchesRepairType && matchesRepairSource
    })
  }, [repairs, searchTerm, statusFilter, priorityFilter, repairTypeFilter, repairSourceFilter])

  // Calculate stats
  const stats = useMemo(() => {
    const today = new Date()
    const thisWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)

    return {
      activeRepairs: repairs.filter((r) => r.status === "in_progress" || r.status === "diagnosed").length,
      pendingApprovals: repairs.filter((r) => r.status === "diagnosed" && !r.customerApproved).length,
      completedThisWeek: repairs.filter((r) => r.status === "completed" && new Date(r.receivedDate) >= thisWeek).length,
    }
  }, [repairs])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-theme-status-success text-theme-text-primary"
      case "in_progress":
        return "bg-theme-status-info text-theme-text-primary"
      case "diagnosed":
        return "bg-theme-status-warning text-theme-text-primary"
      case "approved":
        return "bg-purple-600 text-theme-text-primary"
      case "intake":
        return "bg-gray-600 text-theme-text-primary"
      case "shipped":
        return "bg-theme-status-success text-theme-text-primary"
      default:
        return "bg-gray-600 text-theme-text-primary"
    }
  }

  const getPriorityColor = (priority: string) => {
    return priority === "rush" ? "bg-theme-status-error text-theme-text-primary" : "bg-gray-600 text-theme-text-primary"
  }

  const getRepairTypeColor = (type: string) => {
    switch (type) {
      case "production-rework":
        return "bg-theme-status-info text-theme-text-primary"
      case "finishing-rework":
        return "bg-purple-600 text-theme-text-primary"
      case "acoustic-issues":
        return "bg-pink-600 text-theme-text-primary"
      case "wood-damage":
        return "bg-orange-600 text-theme-text-primary"
      case "hardware-issues":
        return "bg-teal-600 text-theme-text-primary"
      case "driver-problems":
        return "bg-theme-status-error text-theme-text-primary"
      default:
        return "bg-gray-600 text-theme-text-primary"
    }
  }

  const handleStartRepair = (repair: RepairOrder) => {
    setWorkingRepair(repair)
    setCurrentView("repair-work")
    setWorkTime(repair.timeSpent || 0)
  }

  const handleViewCustomerNote = (repair: RepairOrder) => {
    setSelectedCustomerNote(repair.customerNote || "No customer note provided.")
    setCustomerNoteDialogOpen(true)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (currentView === "repair-work" && workingRepair) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
        {renderBreadcrumb()}

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-theme-text-secondary mb-2">{formatTime(workTime)}</div>
          <div className="flex items-center justify-center gap-4">
            {!isWorking ? (
              <Button
                onClick={() => setIsWorking(true)}
                className="bg-theme-status-success hover:bg-green-700 text-theme-text-primary h-12 px-8"
              >
                <Timer className="h-5 w-5 mr-2" />
                START REPAIR
              </Button>
            ) : (
              <Button
                onClick={() => setIsWorking(false)}
                className="bg-theme-status-warning hover:bg-amber-700 text-theme-text-primary h-12 px-8"
              >
                <Timer className="h-5 w-5 mr-2" />
                PAUSE WORK
              </Button>
            )}
          </div>
        </div>

        {/* Repair Details */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary mb-8 max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-theme-text-secondary mb-4">{workingRepair.repairNumber}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-theme-text-tertiary">Customer:</span>
                <p className="text-theme-text-primary font-medium">{workingRepair.customerName}</p>
              </div>
              <div>
                <span className="text-theme-text-tertiary">Model:</span>
                <p className="text-theme-text-primary">{workingRepair.model}</p>
              </div>
              <div>
                <span className="text-theme-text-tertiary">Wood Type:</span>
                <p className="text-theme-text-primary">{workingRepair.woodType}</p>
              </div>
              <div>
                <span className="text-theme-text-tertiary">Repair Type:</span>
                <p className="text-theme-text-primary">{workingRepair.repairType.replace("-", " ")}</p>
              </div>
              <div>
                <span className="text-theme-text-tertiary">Complexity:</span>
                <p className="text-theme-text-primary capitalize">{workingRepair.complexity}</p>
              </div>
              <div>
                <span className="text-theme-text-tertiary">Location:</span>
                <p className="text-theme-text-primary">{workingRepair.location}</p>
              </div>
            </div>

            {workingRepair.customerNote && (
              <div className="mt-4 p-3 bg-theme-bg-primary rounded border border-theme-border-secondary">
                <span className="text-theme-text-tertiary text-sm">Customer Note:</span>
                <p className="text-theme-text-primary mt-1">{workingRepair.customerNote}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Photo Documentation */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary mb-8 max-w-2xl mx-auto">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-theme-text-secondary mb-4">Photo Documentation</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button className="h-16 bg-theme-status-info hover:bg-blue-700 text-theme-text-primary">
                <Camera className="h-6 w-6 mr-2" />
                BEFORE PHOTOS
              </Button>
              <Button className="h-16 bg-theme-status-success hover:bg-green-700 text-theme-text-primary">
                <Camera className="h-6 w-6 mr-2" />
                AFTER PHOTOS
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Repair Actions */}
        <div className="text-center space-y-4">
          <div className="flex gap-4 justify-center">
            <Button className="h-16 bg-theme-status-success hover:bg-green-700 text-theme-text-primary px-8">
              <CheckCircle className="h-6 w-6 mr-2" />
              COMPLETE REPAIR
            </Button>
            <Button className="h-16 bg-theme-status-warning hover:bg-amber-700 text-theme-text-primary px-8">
              <Package className="h-6 w-6 mr-2" />
              RETURN TO PRODUCTION
            </Button>
          </div>

          <Button
            onClick={() => setCurrentView("dashboard")}
            className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary h-12 px-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Repair Center
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
      {renderBreadcrumb()}

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-theme-text-secondary mb-2">REPAIR CENTER</h1>
        <p className="text-xl text-theme-text-tertiary">Production rework and customer repair management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-4xl mx-auto">
        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-theme-text-secondary">Active Repairs</CardTitle>
            <Wrench className="h-4 w-4 text-theme-brand-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-text-primary">{stats.activeRepairs}</div>
            <p className="text-xs text-theme-text-tertiary">In progress + diagnosed</p>
          </CardContent>
        </Card>

        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-theme-text-secondary">Pending Approvals</CardTitle>
            <AlertTriangle className="h-4 w-4 text-theme-status-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-text-primary">{stats.pendingApprovals}</div>
            <p className="text-xs text-theme-text-tertiary">Awaiting customer approval</p>
          </CardContent>
        </Card>

        <Card className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-theme-text-secondary">Completed This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-theme-status-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-theme-text-primary">{stats.completedThisWeek}</div>
            <p className="text-xs text-theme-text-tertiary">Finished repairs</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary mb-8 max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              onClick={() => setCreateRepairDialogOpen(true)}
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Repair Order
            </Button>
            <Button variant="outline" className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20">
              <Package className="mr-2 h-4 w-4" />
              Return to Production
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 mb-6 max-w-4xl mx-auto">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-text-tertiary" />
          <Input
            placeholder="Search repairs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary placeholder-gray-400"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
            <SelectItem value="all" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              All Status
            </SelectItem>
            <SelectItem value="intake" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Intake
            </SelectItem>
            <SelectItem value="diagnosed" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Diagnosed
            </SelectItem>
            <SelectItem value="approved" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Approved
            </SelectItem>
            <SelectItem value="in_progress" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              In Progress
            </SelectItem>
            <SelectItem value="testing" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Testing
            </SelectItem>
            <SelectItem value="completed" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Completed
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={repairTypeFilter} onValueChange={setRepairTypeFilter}>
          <SelectTrigger className="w-48 bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
            <SelectItem value="all" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              All Types
            </SelectItem>
            <SelectItem value="production-rework" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Production Rework
            </SelectItem>
            <SelectItem value="finishing-rework" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Finishing Rework
            </SelectItem>
            <SelectItem value="acoustic-issues" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Acoustic Issues
            </SelectItem>
            <SelectItem value="wood-damage" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Wood Damage
            </SelectItem>
            <SelectItem value="hardware-issues" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Hardware Issues
            </SelectItem>
            <SelectItem value="driver-problems" className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
              Driver Problems
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Repair Queue */}
      <Card className="bg-theme-bg-secondary border-theme-border-primary max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary">Repair Queue ({filteredRepairs.length} repairs)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRepairs.map((repair) => (
              <Card key={repair.id} className="bg-theme-bg-primary border-theme-border-secondary">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-theme-text-secondary">{repair.repairNumber}</h3>
                        <Badge className={getStatusColor(repair.status)}>
                          {repair.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <Badge className={getPriorityColor(repair.priority)}>{repair.priority.toUpperCase()}</Badge>
                        <Badge className={getRepairTypeColor(repair.repairType)}>
                          {repair.repairType.replace("-", " ").toUpperCase()}
                        </Badge>
                        {repair.warrantyStatus === "in-warranty" && (
                          <Badge className="bg-theme-status-success text-theme-text-primary">WARRANTY</Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-theme-text-tertiary">Customer:</span>
                          <p className="text-theme-text-primary font-medium">{repair.customerName}</p>
                        </div>
                        <div>
                          <span className="text-theme-text-tertiary">Model:</span>
                          <p className="text-theme-text-primary">
                            {repair.model} - {repair.woodType}
                          </p>
                        </div>
                        <div>
                          <span className="text-theme-text-tertiary">Location:</span>
                          <p className="text-theme-text-primary">{repair.location || "Repair Wall"}</p>
                        </div>
                        <div>
                          <span className="text-theme-text-tertiary">Time Spent:</span>
                          <p className="text-theme-text-primary">{formatTime(repair.timeSpent || 0)}</p>
                        </div>
                      </div>

                      {repair.originalOrderNumber && (
                        <div className="text-sm text-theme-text-tertiary mt-2">Original Order: {repair.originalOrderNumber}</div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleStartRepair(repair)}
                        className="bg-theme-status-success hover:bg-green-700 text-theme-text-primary h-10 px-4"
                      >
                        <Wrench className="h-4 w-4 mr-2" />
                        START REPAIR
                      </Button>

                      <Button
                        variant="outline"
                        className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20 h-10 px-4"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        VIEW
                      </Button>

                      {repair.customerNote && (
                        <Button
                          onClick={() => handleViewCustomerNote(repair)}
                          variant="outline"
                          className="border-theme-status-info text-theme-status-info hover:bg-theme-status-info/20 h-10 px-4"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          NOTE
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredRepairs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-theme-text-tertiary text-lg">No repairs found matching your criteria</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customer Note Dialog */}
      <Dialog open={customerNoteDialogOpen} onOpenChange={setCustomerNoteDialogOpen}>
        <DialogContent className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
          <DialogHeader>
            <DialogTitle className="text-theme-text-secondary">Customer Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-theme-bg-primary border border-theme-border-secondary rounded-lg p-4">
              <div className="text-sm text-theme-text-tertiary mb-2">Customer&apos;s description of the issue:</div>
              <div className="text-theme-text-primary whitespace-pre-wrap">{selectedCustomerNote}</div>
            </div>
            <div className="flex justify-end">
              <Button
                onClick={() => setCustomerNoteDialogOpen(false)}
                className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
