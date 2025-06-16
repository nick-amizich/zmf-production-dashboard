"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, Package, Users, Settings, Wrench, Home } from "lucide-react"
import { CreateBatchModal } from "@/components/create-batch-modal"
import WorkerManagementBoard from "@/components/management/worker-management-board"
import ProductionCalendar from "@/components/production/production-calendar"

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

export default function BatchManagement() {
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
    // Store the batch in localStorage (in a real app, this would be an API call)
    const existingBatches = JSON.parse(localStorage.getItem('production-batches') || '[]')
    const newBatch = {
      ...batch,
      id: `batch-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active'
    }
    existingBatches.push(newBatch)
    localStorage.setItem('production-batches', JSON.stringify(existingBatches))
    
    // Show success message
    alert(`Batch ${batch.batchNumber} created successfully!`)
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
      <div className="flex items-center gap-2 text-sm text-theme-text-tertiary mb-6">
        <Link href="/dashboard">
          <Button className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary h-10 px-4">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </Link>
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
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
        {renderBreadcrumb()}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-theme-text-secondary mb-2">Production Workflow</h1>
          <p className="text-theme-text-tertiary">Drag and drop batches between production stages</p>
        </div>

        {/* Production Stages */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8">
          {["Intake", "Sanding", "Finishing", "Sub-Assembly", "Final Assembly", "Acoustic QC", "Shipping"].map(
            (stage, index) => (
              <Card key={stage} className="bg-theme-bg-secondary border-theme-border-primary">
                <CardHeader className="pb-3">
                  <CardTitle className="text-theme-text-secondary text-sm text-center">{stage}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Sample batches for demonstration */}
                  {index === 0 &&
                    recentBatches.map((batch) => (
                      <div key={batch.id} className="bg-theme-bg-primary p-3 rounded border border-theme-border-secondary cursor-move">
                        <div className="text-theme-text-primary font-semibold text-sm">{batch.batchNumber}</div>
                        <div className="text-theme-text-tertiary text-xs">{batch.headphoneCount} units</div>
                        <div className="text-theme-text-secondary text-xs">{batch.model}</div>
                      </div>
                    ))}
                  {index !== 0 && <div className="text-theme-text-tertiary text-xs text-center py-4">Drop batches here</div>}
                </CardContent>
              </Card>
            ),
          )}
        </div>

        <div className="text-center">
          <Button onClick={() => setCurrentView("overview")} className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary">
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
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
        {renderBreadcrumb()}

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-theme-text-secondary mb-2">Subassembly Management</h1>
          <p className="text-theme-text-tertiary">Manage chassis and baffle production requirements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Chassis Types Section */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader>
              <CardTitle className="text-theme-text-secondary flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Chassis Types Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {chassisOrders.map((order, index) => (
                <div key={index} className="bg-theme-bg-primary p-4 rounded border border-theme-border-secondary">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-theme-text-primary font-semibold">{order.model}</h3>
                      <p className="text-theme-text-secondary text-sm">{order.chassisType} Chassis</p>
                    </div>
                    <Badge className="bg-theme-brand-secondary text-theme-text-primary">{order.quantity} needed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-theme-text-tertiary text-sm">Due: {order.dueDate}</span>
                    <Button 
                      size="sm" 
                      className="bg-theme-status-info hover:bg-blue-700 text-theme-text-primary"
                      onClick={() => {
                        alert(`Adding ${order.model} chassis to batch queue`)
                      }}
                    >
                      Add to Batch
                    </Button>
                  </div>
                </div>
              ))}

              <Button 
                className="w-full bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
                onClick={() => {
                  const chassisNeeded = chassisOrders.reduce((sum, order) => sum + order.quantity, 0)
                  alert(`Creating chassis batch for ${chassisNeeded} units`)
                }}
              >
                <Package className="h-4 w-4 mr-2" />
                Create Chassis Batch
              </Button>
            </CardContent>
          </Card>

          {/* Baffle Assemblies Section */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardHeader>
              <CardTitle className="text-theme-text-secondary flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Baffle Assemblies Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {baffleOrders.map((order, index) => (
                <div key={index} className="bg-theme-bg-primary p-4 rounded border border-theme-border-secondary">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-theme-text-primary font-semibold">{order.model}</h3>
                      <p className="text-theme-text-secondary text-sm">Model-Specific Baffle</p>
                    </div>
                    <Badge className="bg-theme-brand-secondary text-theme-text-primary">{order.quantity} needed</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-theme-text-tertiary text-sm">Due: {order.dueDate}</span>
                    <Button 
                      size="sm" 
                      className="bg-theme-status-success hover:bg-green-700 text-theme-text-primary"
                      onClick={() => {
                        alert(`Adding ${order.model} baffle to batch queue`)
                      }}
                    >
                      Add to Batch
                    </Button>
                  </div>
                </div>
              ))}

              <Button 
                className="w-full bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
                onClick={() => {
                  const bafflesNeeded = baffleOrders.reduce((sum, order) => sum + order.quantity, 0)
                  alert(`Creating baffle batch for ${bafflesNeeded} units`)
                }}
              >
                <Wrench className="h-4 w-4 mr-2" />
                Create Baffle Batch
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-8">
          <Button onClick={() => setCurrentView("overview")} className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Overview
          </Button>
        </div>
      </div>
    )
  }

  // Overview page
  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
      {renderBreadcrumb()}

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-theme-text-secondary mb-2">Batch Management</h1>
        <p className="text-theme-text-tertiary">Manage production batches and workflow</p>
      </div>

      {/* Top Level Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        <Card
          className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer"
          onClick={() => setCurrentView("calendar")}
        >
          <CardContent className="p-6 text-center">
            <Calendar className="h-12 w-12 text-theme-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-text-secondary mb-2">Production Calendar</h3>
            <p className="text-theme-text-tertiary mb-4">Two-week scheduling and worker assignment</p>
            <div className="space-y-2 text-sm text-theme-text-tertiary">
              <div>• Visual calendar grid</div>
              <div>• Worker capacity management</div>
              <div>• Batch scheduling</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer"
          onClick={() => setCurrentView("subassembly")}
        >
          <CardContent className="p-6 text-center">
            <Wrench className="h-12 w-12 text-theme-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-text-secondary mb-2">Manage Subassembly</h3>
            <p className="text-theme-text-tertiary mb-4">Chassis and baffle production management</p>
            <div className="space-y-2 text-sm text-theme-text-tertiary">
              <div>• Chassis type tracking</div>
              <div>• Baffle assembly queues</div>
              <div>• Shopify order sync</div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer"
          onClick={() => setCurrentView("workers")}
        >
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 text-theme-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-text-secondary mb-2">Worker Management</h3>
            <p className="text-theme-text-tertiary mb-4">Staff assignments and capacity planning</p>
            <div className="space-y-2 text-sm text-theme-text-tertiary">
              <div>• Worker availability</div>
              <div>• Skill-based assignments</div>
              <div>• Performance tracking</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 text-center">
        <Button className="bg-theme-brand-primary hover:bg-theme-brand-primary text-theme-text-primary" onClick={() => setIsCreateBatchModalOpen(true)}>
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
