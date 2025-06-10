"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, Home, Save, Download, Plus, Edit3, Star, Users, Zap, RefreshCw } from "lucide-react"

interface Worker {
  id: string
  name: string
  photo: string
  yearsExperience: number
  overallRating: 1 | 2 | 3
  extension: string
  email: string
  status: "available" | "busy" | "scheduled" | "break" | "out" | "vacation"
  statusDetails?: string
  statusUntil?: string
  primarySkills: Skill[]
  secondarySkills: Skill[]
  backupSkills: Skill[]
  currentAssignment?: Assignment
  trainingNotes: string
  lastUpdated: Date
  outDays?: string[]
}

interface Skill {
  id: string
  name: string
  category: string
  level: "primary" | "secondary" | "learning"
  efficiency: "fast" | "normal" | "slow"
  icon: string
  color: string
}

interface Assignment {
  batchId: string
  batchNumber: string
  model: string
  stage: string
  startTime: Date
  estimatedCompletion: Date
  progress: number
}

interface WorkerManagementBoardProps {
  onBack: () => void
}

export default function WorkerManagementBoard({ onBack }: WorkerManagementBoardProps) {
  const [workers, setWorkers] = useState<Worker[]>([])
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null)
  const [isEditingWorker, setIsEditingWorker] = useState(false)
  const [isAddingWorker, setIsAddingWorker] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [searchFilter, setSearchFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [skillFilter, setSkillFilter] = useState("all")
  const autoSaveTimer = useRef<NodeJS.Timeout>()

  // Available skills database
  const availableSkills: Skill[] = [
    {
      id: "cup-iqc",
      name: "Cup IQC",
      category: "intake",
      level: "primary",
      efficiency: "fast",
      icon: "🔍",
      color: "bg-blue-600",
    },
    {
      id: "robot-sanding",
      name: "Robot Sanding",
      category: "sanding",
      level: "primary",
      efficiency: "fast",
      icon: "🤖",
      color: "bg-purple-600",
    },
    {
      id: "cup-sanding",
      name: "Cup Sanding",
      category: "sanding",
      level: "primary",
      efficiency: "normal",
      icon: "🪚",
      color: "bg-amber-600",
    },
    {
      id: "finishing",
      name: "Finishing",
      category: "finishing",
      level: "primary",
      efficiency: "normal",
      icon: "🎨",
      color: "bg-green-600",
    },
    {
      id: "special-spray",
      name: "Special Spray Finish",
      category: "finishing",
      level: "secondary",
      efficiency: "slow",
      icon: "🎨",
      color: "bg-emerald-600",
    },
    {
      id: "baffle-assembly",
      name: "Baffle Assembly",
      category: "subassembly",
      level: "primary",
      efficiency: "fast",
      icon: "🔧",
      color: "bg-orange-600",
    },
    {
      id: "chassis-assembly",
      name: "Chassis Assembly",
      category: "subassembly",
      level: "primary",
      efficiency: "normal",
      icon: "⚙️",
      color: "bg-red-600",
    },
    {
      id: "headphone-production",
      name: "Headphone Production",
      category: "assembly",
      level: "primary",
      efficiency: "normal",
      icon: "🎧",
      color: "bg-indigo-600",
    },
    {
      id: "final-qc",
      name: "Final QC & Measurement",
      category: "qc",
      level: "primary",
      efficiency: "normal",
      icon: "🎵",
      color: "bg-cyan-600",
    },
    {
      id: "shipping",
      name: "Shipping/Packing",
      category: "shipping",
      level: "primary",
      efficiency: "fast",
      icon: "📦",
      color: "bg-gray-600",
    },
    {
      id: "laser-printing",
      name: "Laser/3D Printing",
      category: "manufacturing",
      level: "secondary",
      efficiency: "normal",
      icon: "🖨️",
      color: "bg-pink-600",
    },
    {
      id: "cable-assembly",
      name: "Cable Assembly",
      category: "assembly",
      level: "secondary",
      efficiency: "fast",
      icon: "⚡",
      color: "bg-yellow-600",
    },
    {
      id: "internal-repairs",
      name: "Internal Repairs",
      category: "repairs",
      level: "secondary",
      efficiency: "slow",
      icon: "🔨",
      color: "bg-rose-600",
    },
    {
      id: "external-repairs",
      name: "External Repairs",
      category: "repairs",
      level: "secondary",
      efficiency: "normal",
      icon: "🛠️",
      color: "bg-violet-600",
    },
  ]

  // Mock worker data
  useEffect(() => {
    const mockWorkers: Worker[] = [
      {
        id: "w1",
        name: "Tony Martinez",
        photo: "/placeholder.svg?height=40&width=40",
        yearsExperience: 8,
        overallRating: 3,
        extension: "x101",
        email: "tony@zmfheadphones.com",
        status: "busy",
        statusDetails: "Working on Verite Closed batch",
        statusUntil: "2024-01-30 15:30",
        primarySkills: [
          availableSkills.find((s) => s.id === "cup-iqc")!,
          availableSkills.find((s) => s.id === "robot-sanding")!,
        ],
        secondarySkills: [availableSkills.find((s) => s.id === "cup-sanding")!],
        backupSkills: [availableSkills.find((s) => s.id === "internal-repairs")!],
        currentAssignment: {
          batchId: "b1",
          batchNumber: "BATCH-2024-001",
          model: "Verite Closed",
          stage: "Intake",
          startTime: new Date("2024-01-30T08:00:00"),
          estimatedCompletion: new Date("2024-01-30T15:30:00"),
          progress: 65,
        },
        trainingNotes: "Expert in cup quality assessment. Training new hires on robot sanding protocols.",
        lastUpdated: new Date(),
        outDays: [],
      },
      {
        id: "w2",
        name: "Jake Thompson",
        photo: "/placeholder.svg?height=40&width=40",
        yearsExperience: 6,
        overallRating: 3,
        extension: "x102",
        email: "jake@zmfheadphones.com",
        status: "available",
        primarySkills: [
          availableSkills.find((s) => s.id === "cup-sanding")!,
          availableSkills.find((s) => s.id === "headphone-production")!,
        ],
        secondarySkills: [availableSkills.find((s) => s.id === "final-qc")!],
        backupSkills: [availableSkills.find((s) => s.id === "baffle-assembly")!],
        trainingNotes: "Excellent at final assembly. Working on acoustic measurement certification.",
        lastUpdated: new Date(),
        outDays: ["2024-02-10", "2024-02-11"],
      },
      {
        id: "w3",
        name: "Kevin Chen",
        photo: "/placeholder.svg?height=40&width=40",
        yearsExperience: 10,
        overallRating: 3,
        extension: "x103",
        email: "kevin@zmfheadphones.com",
        status: "busy",
        statusDetails: "Finishing Caldera Open batch",
        statusUntil: "2024-01-30 18:00",
        primarySkills: [
          availableSkills.find((s) => s.id === "finishing")!,
          availableSkills.find((s) => s.id === "special-spray")!,
        ],
        secondarySkills: [availableSkills.find((s) => s.id === "laser-printing")!],
        backupSkills: [],
        currentAssignment: {
          batchId: "b2",
          batchNumber: "BATCH-2024-002",
          model: "Caldera Open",
          stage: "Finishing",
          startTime: new Date("2024-01-30T09:00:00"),
          estimatedCompletion: new Date("2024-01-30T18:00:00"),
          progress: 80,
        },
        trainingNotes: "Lead finishing specialist. Developing new spray techniques for exotic woods.",
        lastUpdated: new Date(),
        outDays: [],
      },
      {
        id: "w4",
        name: "Matt Wilson",
        photo: "/placeholder.svg?height=40&width=40",
        yearsExperience: 7,
        overallRating: 3,
        extension: "x104",
        email: "matt@zmfheadphones.com",
        status: "scheduled",
        statusDetails: "Acoustic QC scheduled for 2pm",
        statusUntil: "2024-01-30 14:00",
        primarySkills: [
          availableSkills.find((s) => s.id === "final-qc")!,
          availableSkills.find((s) => s.id === "headphone-production")!,
        ],
        secondarySkills: [
          availableSkills.find((s) => s.id === "internal-repairs")!,
          availableSkills.find((s) => s.id === "external-repairs")!,
        ],
        backupSkills: [availableSkills.find((s) => s.id === "cable-assembly")!],
        trainingNotes: "Acoustic measurement expert. Handles all warranty repairs and customer issues.",
        lastUpdated: new Date(),
        outDays: [],
      },
      {
        id: "w5",
        name: "Laura Davis",
        photo: "/placeholder.svg?height=40&width=40",
        yearsExperience: 4,
        overallRating: 2,
        extension: "x105",
        email: "laura@zmfheadphones.com",
        status: "available",
        primarySkills: [availableSkills.find((s) => s.id === "shipping")!],
        secondarySkills: [
          availableSkills.find((s) => s.id === "cable-assembly")!,
          availableSkills.find((s) => s.id === "laser-printing")!,
        ],
        backupSkills: [availableSkills.find((s) => s.id === "baffle-assembly")!],
        trainingNotes: "Shipping specialist. Learning cable assembly and 3D printing operations.",
        lastUpdated: new Date(),
        outDays: [],
      },
      {
        id: "w6",
        name: "Stephen Chen",
        photo: "/placeholder.svg?height=40&width=40",
        yearsExperience: 2,
        overallRating: 1,
        extension: "x106",
        email: "stephen@zmfheadphones.com",
        status: "break",
        statusDetails: "Lunch break",
        statusUntil: "2024-01-30 13:00",
        primarySkills: [availableSkills.find((s) => s.id === "cup-iqc")!],
        secondarySkills: [availableSkills.find((s) => s.id === "cup-sanding")!],
        backupSkills: [availableSkills.find((s) => s.id === "shipping")!],
        trainingNotes:
          "New hire in training. Progressing well with intake procedures. Needs mentoring on sanding techniques.",
        lastUpdated: new Date(),
        outDays: [],
      },
    ]
    setWorkers(mockWorkers)
  }, [])

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
      autoSaveTimer.current = setTimeout(() => {
        handleSave()
      }, 3000) // Auto-save after 3 seconds of inactivity
    }
    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current)
      }
    }
  }, [hasUnsavedChanges])

  const handleSave = () => {
    // In real implementation, this would save to backend
    setLastSaved(new Date())
    setHasUnsavedChanges(false)
    console.log("Saving worker data...")
  }

  const handleWorkerUpdate = (workerId: string, updates: Partial<Worker>) => {
    setWorkers((prev) =>
      prev.map((worker) => (worker.id === workerId ? { ...worker, ...updates, lastUpdated: new Date() } : worker)),
    )
    setHasUnsavedChanges(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-600"
      case "busy":
        return "bg-red-600"
      case "scheduled":
        return "bg-amber-600"
      case "break":
        return "bg-blue-600"
      case "out":
        return "bg-gray-600"
      case "vacation":
        return "bg-purple-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return "🟢"
      case "busy":
        return "🔴"
      case "scheduled":
        return "🟡"
      case "break":
        return "🔵"
      case "out":
        return "⚫"
      case "vacation":
        return "🏖️"
      default:
        return "⚪"
    }
  }

  const renderSkillLevel = (level: number) => {
    return Array(level)
      .fill(0)
      .map((_, i) => <Star key={i} className="h-4 w-4 text-[#d4a574] fill-[#d4a574]" />)
  }

  const renderSkillBadge = (skill: Skill) => (
    <Badge key={skill.id} className={`${skill.color} text-white text-xs mr-1 mb-1`}>
      <span className="mr-1">{skill.icon}</span>
      {skill.name}
      {skill.efficiency === "fast" && <Zap className="h-3 w-3 ml-1" />}
    </Badge>
  )

  const filteredWorkers = workers.filter((worker) => {
    const matchesSearch =
      worker.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      worker.email.toLowerCase().includes(searchFilter.toLowerCase())
    const matchesStatus = statusFilter === "all" || worker.status === statusFilter
    const matchesSkill =
      skillFilter === "all" ||
      worker.primarySkills.some((skill) => skill.category === skillFilter) ||
      worker.secondarySkills.some((skill) => skill.category === skillFilter)

    return matchesSearch && matchesStatus && matchesSkill
  })

  const stats = {
    totalWorkers: workers.length,
    availableWorkers: workers.filter((w) => w.status === "available").length,
    busyWorkers: workers.filter((w) => w.status === "busy").length,
    totalSkills: availableSkills.length,
    skillCoverage: Math.round(
      (workers.reduce((acc, worker) => acc + worker.primarySkills.length + worker.secondarySkills.length, 0) /
        (workers.length * availableSkills.length)) *
        100,
    ),
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
      {/* Header */}
      <header className="border-b border-[#8B4513]/30 bg-[#1a0d08]/50 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-[#d4a574]" />
            <div>
              <h1 className="text-2xl font-bold text-[#d4a574]">Worker Skills & Availability Management</h1>
              <p className="text-sm text-gray-400">
                {stats.totalWorkers} Active Workers | {stats.totalSkills} Specialized Tasks | {stats.skillCoverage}%
                Coverage
              </p>
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
            <div className="text-sm">
              <span className="text-[#d4a574]">{stats.availableWorkers} Available</span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-[#d4a574]">{stats.busyWorkers} Working</span>
              <span className="mx-2 text-gray-500">|</span>
              <span className="text-gray-400">
                Last saved: {lastSaved.toLocaleTimeString()}
                {hasUnsavedChanges && <span className="text-amber-400 ml-2">• Unsaved changes</span>}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleSave}
              disabled={!hasUnsavedChanges}
              className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {hasUnsavedChanges ? "Save Changes" : "Saved"}
            </Button>

            <Button variant="outline" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>

            <Button onClick={() => setIsAddingWorker(true)} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Worker
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="p-6 border-b border-[#8B4513]/30">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <Input
              placeholder="Search workers by name or email..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="bg-[#1a0d08] border-[#8B4513]/30 text-white"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-[#1a0d08] border-[#8B4513]/30 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a0d08] border-[#8B4513]/30">
              <SelectItem value="all" className="text-white">
                All Statuses
              </SelectItem>
              <SelectItem value="available" className="text-white">
                Available
              </SelectItem>
              <SelectItem value="busy" className="text-white">
                Busy
              </SelectItem>
              <SelectItem value="scheduled" className="text-white">
                Scheduled
              </SelectItem>
              <SelectItem value="break" className="text-white">
                On Break
              </SelectItem>
              <SelectItem value="out" className="text-white">
                Out/Sick
              </SelectItem>
              <SelectItem value="vacation" className="text-white">
                Vacation
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={skillFilter} onValueChange={setSkillFilter}>
            <SelectTrigger className="w-[180px] bg-[#1a0d08] border-[#8B4513]/30 text-white">
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent className="bg-[#1a0d08] border-[#8B4513]/30">
              <SelectItem value="all" className="text-white">
                All Skills
              </SelectItem>
              <SelectItem value="intake" className="text-white">
                Intake
              </SelectItem>
              <SelectItem value="sanding" className="text-white">
                Sanding
              </SelectItem>
              <SelectItem value="finishing" className="text-white">
                Finishing
              </SelectItem>
              <SelectItem value="subassembly" className="text-white">
                Sub-Assembly
              </SelectItem>
              <SelectItem value="assembly" className="text-white">
                Assembly
              </SelectItem>
              <SelectItem value="qc" className="text-white">
                Quality Control
              </SelectItem>
              <SelectItem value="shipping" className="text-white">
                Shipping
              </SelectItem>
              <SelectItem value="repairs" className="text-white">
                Repairs
              </SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Worker Management Table */}
      <div className="p-6">
        <div className="bg-[#1a0d08] border border-[#8B4513]/30 rounded-lg overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-11 gap-4 p-4 bg-[#0a0a0a] border-b border-[#8B4513]/30 text-sm font-medium text-[#d4a574]">
            <div className="col-span-2">Worker</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-2">Primary Skills</div>
            <div className="col-span-2">Secondary Skills</div>
            <div className="col-span-1">Backup Skills</div>
            <div className="col-span-2">Current Assignment</div>
            <div className="col-span-1">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-[#8B4513]/20">
            {filteredWorkers.map((worker) => (
              <div key={worker.id} className="grid grid-cols-11 gap-4 p-4 hover:bg-[#0a0a0a]/50 transition-colors">
                {/* Worker Column */}
                <div className="col-span-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={worker.photo || "/placeholder.svg"}
                      alt={worker.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-white">{worker.name}</div>
                      {worker.outDays && worker.outDays.length > 0 && (
                        <div className="text-xs text-red-500">
                          Out: {worker.outDays.map((day) => new Date(day).toLocaleDateString()).join(", ")}
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        {renderSkillLevel(worker.overallRating)}
                        <span className="ml-1">{worker.yearsExperience}y exp</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {worker.extension} • {worker.email}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Column */}
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getStatusIcon(worker.status)}</span>
                    <div>
                      <div className={`text-xs px-2 py-1 rounded ${getStatusColor(worker.status)} text-white`}>
                        {worker.status.toUpperCase()}
                      </div>
                      {worker.statusDetails && <div className="text-xs text-gray-400 mt-1">{worker.statusDetails}</div>}
                      {worker.statusUntil && (
                        <div className="text-xs text-gray-500">
                          Until {new Date(worker.statusUntil).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Skills Column */}
                <div className="col-span-2">
                  <div className="flex flex-wrap">{worker.primarySkills.map((skill) => renderSkillBadge(skill))}</div>
                </div>

                {/* Secondary Skills Column */}
                <div className="col-span-2">
                  <div className="flex flex-wrap">{worker.secondarySkills.map((skill) => renderSkillBadge(skill))}</div>
                </div>

                {/* Backup Skills Column */}
                <div className="col-span-1">
                  <div className="flex flex-wrap">{worker.backupSkills.map((skill) => renderSkillBadge(skill))}</div>
                </div>

                {/* Current Assignment Column */}
                <div className="col-span-2">
                  {worker.currentAssignment ? (
                    <div className="bg-[#0a0a0a] p-2 rounded border border-[#8B4513]/20">
                      <div className="text-sm font-medium text-[#d4a574]">{worker.currentAssignment.batchNumber}</div>
                      <div className="text-xs text-gray-400">
                        {worker.currentAssignment.model} - {worker.currentAssignment.stage}
                      </div>
                      <Progress value={worker.currentAssignment.progress} className="mt-1 h-1" />
                      <div className="text-xs text-gray-500 mt-1">{worker.currentAssignment.progress}% complete</div>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">No active assignment</div>
                  )}
                </div>

                {/* Actions Column */}
                <div className="col-span-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedWorker(worker)
                      setIsEditingWorker(true)
                    }}
                    className="h-8 w-8 p-0 border-[#8B4513]/30 text-[#d4a574] hover:bg-[#8B4513]/20"
                  >
                    <Edit3 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Worker Dialog */}
      <Dialog open={isEditingWorker} onOpenChange={setIsEditingWorker}>
        <DialogContent className="bg-[#1a0d08] border-[#8B4513]/30 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#d4a574]">Edit Worker: {selectedWorker?.name}</DialogTitle>
          </DialogHeader>

          {selectedWorker && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="bg-[#0a0a0a] border border-[#8B4513]/20">
                <TabsTrigger value="basic" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="skills" className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white">
                  Skills & Training
                </TabsTrigger>
                <TabsTrigger
                  value="assignment"
                  className="data-[state=active]:bg-[#8B4513] data-[state=active]:text-white"
                >
                  Current Assignment
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Name</label>
                    <Input
                      value={selectedWorker.name}
                      onChange={(e) => handleWorkerUpdate(selectedWorker.id, { name: e.target.value })}
                      className="bg-[#0a0a0a] border-[#8B4513]/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Email</label>
                    <Input
                      value={selectedWorker.email}
                      onChange={(e) => handleWorkerUpdate(selectedWorker.id, { email: e.target.value })}
                      className="bg-[#0a0a0a] border-[#8B4513]/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Extension</label>
                    <Input
                      value={selectedWorker.extension}
                      onChange={(e) => handleWorkerUpdate(selectedWorker.id, { extension: e.target.value })}
                      className="bg-[#0a0a0a] border-[#8B4513]/30 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Years Experience</label>
                    <Input
                      type="number"
                      value={selectedWorker.yearsExperience}
                      onChange={(e) =>
                        handleWorkerUpdate(selectedWorker.id, { yearsExperience: Number.parseInt(e.target.value) })
                      }
                      className="bg-[#0a0a0a] border-[#8B4513]/30 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Current Status</label>
                  <Select
                    value={selectedWorker.status}
                    onValueChange={(value) => handleWorkerUpdate(selectedWorker.id, { status: value as any })}
                  >
                    <SelectTrigger className="bg-[#0a0a0a] border-[#8B4513]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a0d08] border-[#8B4513]/30">
                      <SelectItem value="available" className="text-white">
                        Available
                      </SelectItem>
                      <SelectItem value="busy" className="text-white">
                        Busy
                      </SelectItem>
                      <SelectItem value="scheduled" className="text-white">
                        Scheduled
                      </SelectItem>
                      <SelectItem value="break" className="text-white">
                        On Break
                      </SelectItem>
                      <SelectItem value="out" className="text-white">
                        Out/Sick
                      </SelectItem>
                      <SelectItem value="vacation" className="text-white">
                        Vacation
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Training Notes</label>
                  <Textarea
                    value={selectedWorker.trainingNotes}
                    onChange={(e) => handleWorkerUpdate(selectedWorker.id, { trainingNotes: e.target.value })}
                    className="bg-[#0a0a0a] border-[#8B4513]/30 text-white"
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="skills" className="mt-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-[#d4a574] mb-3">Primary Skills</h3>
                    <div
                      className="min-h-[80px] p-4 border-2 border-dashed border-[#8B4513]/30 rounded-lg bg-[#0a0a0a]/50"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const skillId = e.dataTransfer.getData("text/plain")
                        const skill = availableSkills.find((s) => s.id === skillId)
                        if (skill && !selectedWorker.primarySkills.some((s) => s.id === skillId)) {
                          const updatedWorker = {
                            ...selectedWorker,
                            primarySkills: [...selectedWorker.primarySkills, skill],
                            secondarySkills: selectedWorker.secondarySkills.filter((s) => s.id !== skillId),
                            backupSkills: selectedWorker.backupSkills.filter((s) => s.id !== skillId),
                          }
                          setSelectedWorker(updatedWorker)
                          handleWorkerUpdate(selectedWorker.id, updatedWorker)
                        }
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {selectedWorker.primarySkills.map((skill) => (
                          <div
                            key={skill.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", skill.id)}
                            className="cursor-move hover:scale-105 transition-transform"
                          >
                            <Badge className={`${skill.color} text-white text-xs relative group`}>
                              <span className="mr-1">{skill.icon}</span>
                              {skill.name}
                              {skill.efficiency === "fast" && <Zap className="h-3 w-3 ml-1" />}
                              <button
                                onClick={() => {
                                  const updatedWorker = {
                                    ...selectedWorker,
                                    primarySkills: selectedWorker.primarySkills.filter((s) => s.id !== skill.id),
                                  }
                                  setSelectedWorker(updatedWorker)
                                  handleWorkerUpdate(selectedWorker.id, updatedWorker)
                                }}
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-300"
                              >
                                ×
                              </button>
                            </Badge>
                          </div>
                        ))}
                        {selectedWorker.primarySkills.length === 0 && (
                          <div className="text-gray-500 italic text-sm">Drag skills here to set as primary</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#d4a574] mb-3">Secondary Skills</h3>
                    <div
                      className="min-h-[80px] p-4 border-2 border-dashed border-[#8B4513]/30 rounded-lg bg-[#0a0a0a]/50"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const skillId = e.dataTransfer.getData("text/plain")
                        const skill = availableSkills.find((s) => s.id === skillId)
                        if (skill && !selectedWorker.secondarySkills.some((s) => s.id === skillId)) {
                          const updatedWorker = {
                            ...selectedWorker,
                            secondarySkills: [...selectedWorker.secondarySkills, skill],
                            primarySkills: selectedWorker.primarySkills.filter((s) => s.id !== skillId),
                            backupSkills: selectedWorker.backupSkills.filter((s) => s.id !== skillId),
                          }
                          setSelectedWorker(updatedWorker)
                          handleWorkerUpdate(selectedWorker.id, updatedWorker)
                        }
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {selectedWorker.secondarySkills.map((skill) => (
                          <div
                            key={skill.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", skill.id)}
                            className="cursor-move hover:scale-105 transition-transform"
                          >
                            <Badge className={`${skill.color} text-white text-xs relative group`}>
                              <span className="mr-1">{skill.icon}</span>
                              {skill.name}
                              {skill.efficiency === "fast" && <Zap className="h-3 w-3 ml-1" />}
                              <button
                                onClick={() => {
                                  const updatedWorker = {
                                    ...selectedWorker,
                                    secondarySkills: selectedWorker.secondarySkills.filter((s) => s.id !== skill.id),
                                  }
                                  setSelectedWorker(updatedWorker)
                                  handleWorkerUpdate(selectedWorker.id, updatedWorker)
                                }}
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-300"
                              >
                                ×
                              </button>
                            </Badge>
                          </div>
                        ))}
                        {selectedWorker.secondarySkills.length === 0 && (
                          <div className="text-gray-500 italic text-sm">Drag skills here to set as secondary</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#d4a574] mb-3">Backup Skills</h3>
                    <div
                      className="min-h-[80px] p-4 border-2 border-dashed border-[#8B4513]/30 rounded-lg bg-[#0a0a0a]/50"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault()
                        const skillId = e.dataTransfer.getData("text/plain")
                        const skill = availableSkills.find((s) => s.id === skillId)
                        if (skill && !selectedWorker.backupSkills.some((s) => s.id === skillId)) {
                          const updatedWorker = {
                            ...selectedWorker,
                            backupSkills: [...selectedWorker.backupSkills, skill],
                            primarySkills: selectedWorker.primarySkills.filter((s) => s.id !== skillId),
                            secondarySkills: selectedWorker.secondarySkills.filter((s) => s.id !== skillId),
                          }
                          setSelectedWorker(updatedWorker)
                          handleWorkerUpdate(selectedWorker.id, updatedWorker)
                        }
                      }}
                    >
                      <div className="flex flex-wrap gap-2">
                        {selectedWorker.backupSkills.map((skill) => (
                          <div
                            key={skill.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text/plain", skill.id)}
                            className="cursor-move hover:scale-105 transition-transform"
                          >
                            <Badge className={`${skill.color} text-white text-xs relative group`}>
                              <span className="mr-1">{skill.icon}</span>
                              {skill.name}
                              {skill.efficiency === "fast" && <Zap className="h-3 w-3 ml-1" />}
                              <button
                                onClick={() => {
                                  const updatedWorker = {
                                    ...selectedWorker,
                                    backupSkills: selectedWorker.backupSkills.filter((s) => s.id !== skill.id),
                                  }
                                  setSelectedWorker(updatedWorker)
                                  handleWorkerUpdate(selectedWorker.id, updatedWorker)
                                }}
                                className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-white hover:text-red-300"
                              >
                                ×
                              </button>
                            </Badge>
                          </div>
                        ))}
                        {selectedWorker.backupSkills.length === 0 && (
                          <div className="text-gray-500 italic text-sm">Drag skills here to set as backup</div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-[#d4a574] mb-3">Available Skills</h3>
                    <div className="p-4 border border-[#8B4513]/20 rounded-lg bg-[#1a0d08]/30">
                      <div className="grid grid-cols-2 gap-2">
                        {availableSkills
                          .filter(
                            (skill) =>
                              !selectedWorker.primarySkills.some((s) => s.id === skill.id) &&
                              !selectedWorker.secondarySkills.some((s) => s.id === skill.id) &&
                              !selectedWorker.backupSkills.some((s) => s.id === skill.id),
                          )
                          .map((skill) => (
                            <div
                              key={skill.id}
                              draggable
                              onDragStart={(e) => e.dataTransfer.setData("text/plain", skill.id)}
                              className="cursor-move hover:scale-105 transition-transform"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start border-[#8B4513]/30 text-white hover:bg-[#8B4513]/20 pointer-events-none"
                              >
                                <span className="mr-2">{skill.icon}</span>
                                {skill.name}
                                <div className="ml-auto text-xs text-gray-400">Drag to add</div>
                              </Button>
                            </div>
                          ))}
                      </div>
                      {availableSkills.filter(
                        (skill) =>
                          !selectedWorker.primarySkills.some((s) => s.id === skill.id) &&
                          !selectedWorker.secondarySkills.some((s) => s.id === skill.id) &&
                          !selectedWorker.backupSkills.some((s) => s.id === skill.id),
                      ).length === 0 && (
                        <div className="text-center text-gray-500 italic py-4">All skills have been assigned</div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0a0a0a] p-4 rounded-lg border border-[#8B4513]/20">
                    <h4 className="text-sm font-medium text-[#d4a574] mb-2">How to use:</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                      <li>• Drag skills from "Available Skills" to assign them</li>
                      <li>• Drag between Primary, Secondary, and Backup to reorganize</li>
                      <li>• Click the × button to remove a skill entirely</li>
                      <li>• Primary skills are the worker's main expertise</li>
                      <li>• Secondary skills are competent backup abilities</li>
                      <li>• Backup skills are emergency coverage capabilities</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assignment" className="mt-4">
                {selectedWorker.currentAssignment ? (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-[#d4a574]">Current Assignment</h3>
                    <div className="bg-[#0a0a0a] p-4 rounded border border-[#8B4513]/20">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-400">Batch Number</div>
                          <div className="text-white font-medium">{selectedWorker.currentAssignment.batchNumber}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Model</div>
                          <div className="text-white">{selectedWorker.currentAssignment.model}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Stage</div>
                          <div className="text-white">{selectedWorker.currentAssignment.stage}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Progress</div>
                          <div className="text-white">{selectedWorker.currentAssignment.progress}%</div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Progress value={selectedWorker.currentAssignment.progress} className="h-2" />
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button variant="outline" className="border-amber-500 text-amber-400 hover:bg-amber-500/20">
                          Reassign Work
                        </Button>
                        <Button variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/20">
                          Remove Assignment
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">No current assignment</div>
                    <Button className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">Assign New Work</Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditingWorker(false)}
              className="border-[#8B4513]/30 text-white hover:bg-[#8B4513]/20"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleSave()
                setIsEditingWorker(false)
              }}
              className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
