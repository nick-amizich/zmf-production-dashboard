"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Package, Users, Settings, Wrench, Home } from "lucide-react"
import { CreateBatchModal } from "./components/create-batch-modal"
import WorkerManagementBoard from "./worker-management-board"
import ProductionCalendar from "./production-calendar"

interface BatchManagementProps {
  onBack: () => void
}

type BatchView = "overview" | "workflow" | "subassembly" | "calendar" | "workers"

interface RecentBatch {
  id: string
  batchNumber: string
  headphoneCount: number
  model: string
  woodType: string
  currentStage: string
  readyForSanding: boolean
  estimatedSandingTime: string
}

const workers = ["Tony Martinez", "Jake Thompson", "Kevin Chen", "Matt Wilson", "Laura Davis", "Sam Rodriguez"]

const recentBatches: RecentBatch[] = [
  {
    id: "1",
    batchNumber: "BATCH-2024-001",
    headphoneCount: 4,
    model: "Verite Closed",
    woodType: "Sapele",
    currentStage: "intake",
    readyForSanding: true,
    estimatedSandingTime: "2.5h",
  },
  {
    id: "2",
    batchNumber: "BATCH-2024-003",
    headphoneCount: 6,
    model: "Auteur",
    woodType: "Cherry",
    currentStage: "intake",
    readyForSanding: true,
    estimatedSandingTime: "3.0h",
  },
  {
    id: "3",
    batchNumber: "BATCH-2024-005",
    headphoneCount: 2,
    model: "Caldera Open",
    woodType: "Cocobolo",
    currentStage: "intake",
    readyForSanding: false,
    estimatedSandingTime: "1.5h",
  },
]

const chassisOrders = [
  { model: "Verite Closed", chassisType: "Aluminum", quantity: 8, dueDate: "2024-01-20" },
  { model: "Caldera Open", chassisType: "Magnesium", quantity: 4, dueDate: "2024-01-18" },
  { model: "Auteur", chassisType: "Aluminum", quantity: 12, dueDate: "2024-01-25" },
  { model: "Aeolus", chassisType: "Aluminum", quantity: 6, dueDate: "2024-01-22" },
]

const baffleOrders = [
  { model: "Verite Closed", quantity: 8, dueDate: "2024-01-20" },
  { model: "Caldera Open", quantity: 4, dueDate: "2024-01-18" },
  { model: "Auteur", quantity: 12, dueDate: "2024-01-25" },
  { model: "Aeolus", quantity: 6, dueDate: "2024-01-22" },
  { model: "Atticus", quantity: 3, dueDate: "2024-01-24" },
]

export default function BatchManagement({ onBack }: BatchManagementProps) {
  const [currentView, setCurrentView] = useState<BatchView>("overview")
  const [isCreateBatchModalOpen, setIsCreateBatchModalOpen] = useState(false)

  const [availableOrders] = useState([
    {
      id: "order-1",
      orderNumber: "ZMF-2024-001",
      customerName: "John Smith",
      model: "Verite Closed",
      woodType: "Sapele",
      priority: "normal" as const,
      dueDate: "2024-01-25",
    },
    {
      id: "order-2",
      orderNumber: "ZMF-2024-002",
      customerName: "Sarah Johnson",
      model: "Auteur",
      woodType: "Cherry",
      priority: "high" as const,
      dueDate: "2024-01-22",
    },
    {
      id: "order-3",
      orderNumber: "ZMF-2024-003",
      customerName: "Mike Davis",
      model: "Caldera Open",
      woodType: "Cocobolo",
      priority: "urgent" as const,
      dueDate: "2024-01-20",
    },
    {
      id: "order-4",
      orderNumber: "ZMF-2024-004",
      customerName: "Lisa Chen",
      model: "Aeolus",
      woodType: "Walnut",
      priority: "normal" as const,
      dueDate: "2024-01-28",
    },
  ])

  const handleCreateBatch = (batch: any) => {
    console.log("Creating batch:", batch)
    setIsCreateBatchModalOpen(false)
  }

  const renderBreadcrumb = () => {
    const paths = ["Batch Management"]

    if (currentView === "workflow") {
      paths.push("Production Workflow")
    } else if (currentView === "subassembly") {
      paths.push("Subassembly Management")
    } else if (currentView === "calendar") {
      paths.push("Production Calendar")
    } else if (currentView === "workers") {
      paths.push("Worker Management")
    }

    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 mb-6">
        <Button onClick={onBack} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white h-10 px-4">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
        <span>→</span>
        {paths.map((path, index) => (
          <span key={index} className={index === paths.length - 1 ? "text-[#d4a574]" : ""}>
            {path}
            {index < paths.length - 1 && <span className="mx-2">→</span>}
          </span>
        ))}
      </div>
    )
  }

  // Worker Management View
  if (currentView === "workers") {
    return <WorkerManagementBoard onBack={() => setCurrentView("overview")} />
  }

  // Production Calendar View
  if (currentView === "calendar") {
    return <ProductionCalendar onBack={() => setCurrentView("overview")} />
  }

  // Production Workflow View
  if (currentView === "workflow") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white p-6">
        {renderBreadcrumb()}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#d4a574] mb-2">Production Workflow</h1>
          <p className="text-gray-300">Drag and drop batches between production stages</p>
        </div>

        {/* Production Stages */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8">
          {["Intake", "Sanding", "Finishing", "Sub-Assembly", "Final Assembly", "Acoustic QC", "Shipping"].map(
            (stage, index) => (
              <Card key={stage} className="bg-[#1a0d08] border-[#8B4513]/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-[#d4a574] text-sm text-center">{stage}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Sample batches for demonstration */}
                  {index === 0 &&
                    recentBatches.map((batch) => (
                      <div key={batch.id} className="bg-[#0a0a0a] p-3 rounded border border-[#8B4513]/20 cursor-move">
                        <div className="text-white font-semibold text-sm">{batch.batchNumber}</div>
                        <div className="text-gray-400 text-xs">{batch.headphoneCount} units</div>
                        <div className="text-[#d4a574] text-xs">{batch.model}</div>
                      </div>
                    ))}
                  {index !== 0 && <div className="text-gray-500 text-xs text-center py-4">Drop batches here</div>}
                </CardContent>
              </Card>
            ),
          )}
        </div>

        <div className="text-center">
          <Button onClick={() => setCurrentView("overview")} className="bg-gray-600 hover:bg-gray-700 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
        </div>
      </div>
    )
  }

  // Subassembly Management View
  if (currentView === "subassembly") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white p-6">
        {renderBreadcrumb()}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#d4a574] mb-2">Subassembly Management</h1>
          <p className="text-gray-300">Manage chassis and baffle production requirements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Chassis Types Section */}
          <Card className="bg-[#1a0d08] border-[#8B4513]/30">
            <CardHeader>
              <CardTitle className="text-[#d4a574] flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Chassis Types Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {chassisOrders.map((order, index) => (
                <div key={index} className="bg-[#0a0a0a] p-4 rounded border border-[#8B4513]/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{order.model}</h3>
                      <p className="text-[#d4a574] text-sm">{order.chassisType} Chassis</p>
                    </div>
                    <Badge className="bg-[#8B4513] text-white">{order.quantity} needed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Due: {order.dueDate}</span>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                      Add to Batch
                    </Button>
                  </div>
                </div>
              ))}

              <Button className="w-full bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
                <Package className="h-4 w-4 mr-2" />
                Create Chassis Batch
              </Button>
            </CardContent>
          </Card>

          {/* Baffle Assemblies Section */}
          <Card className="bg-[#1a0d08] border-[#8B4513]/30">
            <CardHeader>
              <CardTitle className="text-[#d4a574] flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Baffle Assemblies Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {baffleOrders.map((order, index) => (
                <div key={index} className="bg-[#0a0a0a] p-4 rounded border border-[#8B4513]/20">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-white font-semibold">{order.model}</h3>
                      <p className="text-[#d4a574] text-sm">Model-Specific Baffle</p>
                    </div>
                    <Badge className="bg-[#8B4513] text-white">{order.quantity} needed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Due: {order.dueDate}</span>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                      Add to Batch
                    </Button>
                  </div>
                </div>
              ))}

              <Button className="w-full bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
                <Wrench className="h-4 w-4 mr-2" />
                Create Baffle Batch
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button onClick={() => setCurrentView("overview")} className="bg-gray-600 hover:bg-gray-700 text-white">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
        </div>
      </div>
    )
  }

  // Overview page
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white p-6">
      {renderBreadcrumb()}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#d4a574] mb-2">Batch Management</h1>
        <p className="text-gray-300">Manage production batches and workflow</p>
      </div>

      {/* Top Level Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card
          className="bg-[#1a0d08] border-[#8B4513]/30 hover:border-[#d4a574]/50 transition-all cursor-pointer"
          onClick={() => setCurrentView("calendar")}
        >
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-[#d4a574] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#d4a574] mb-2">Production Calendar</h3>
            <p className="text-gray-300 mb-4">Two-week scheduling and worker assignment</p>
            <div className="space-y-2 text-sm text-gray-400">
              <div>• Visual calendar grid</div>
              <div>• Worker capacity management</div>
              <div>• Batch scheduling</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-[#1a0d08] border-[#8B4513]/30 hover:border-[#d4a574]/50 transition-all cursor-pointer"
          onClick={() => setCurrentView("subassembly")}
        >
          <CardContent className="p-6 text-center">
            <Wrench className="h-12 w-12 text-[#d4a574] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#d4a574] mb-2">Manage Subassembly</h3>
            <p className="text-gray-300 mb-4">Chassis and baffle production management</p>
            <div className="space-y-2 text-sm text-gray-400">
              <div>• Chassis type tracking</div>
              <div>• Baffle assembly queues</div>
              <div>• Shopify order sync</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-[#1a0d08] border-[#8B4513]/30 hover:border-[#d4a574]/50 transition-all cursor-pointer"
          onClick={() => setCurrentView("workers")}
        >
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-[#d4a574] mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#d4a574] mb-2">Worker Management</h3>
            <p className="text-gray-300 mb-4">Staff assignments and capacity planning</p>
            <div className="space-y-2 text-sm text-gray-400">
              <div>• Worker availability</div>
              <div>• Skill-based assignments</div>
              <div>• Performance tracking</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button className="bg-[#d4a574] hover:bg-[#c49564] text-black" onClick={() => setIsCreateBatchModalOpen(true)}>
          Create New Batch
        </Button>
      </div>

      <CreateBatchModal
        isOpen={isCreateBatchModalOpen}
        onClose={() => setIsCreateBatchModalOpen(false)}
        availableOrders={availableOrders}
        workers={workers}
        onCreateBatch={handleCreateBatch}
      />
    </div>
  )
}
