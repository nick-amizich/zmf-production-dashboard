"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Package, Users, Settings, Wrench, Home, GitBranch } from "lucide-react"
import { CreateBatchModal } from "@/components/create-batch-modal"

const workers = ["Tony Martinez", "Jake Thompson", "Kevin Chen", "Matt Wilson", "Laura Davis", "Sam Rodriguez"]

export default function BatchManagementOverview() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
      <div className="flex items-center gap-2 text-sm text-theme-text-tertiary mb-6">
        <Link href="/dashboard">
          <Button className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary h-10 px-4">
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
        </Link>
        <span>→</span>
        <span className="text-theme-text-secondary">Batch Management</span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-theme-text-secondary mb-2">Batch Management</h1>
        <p className="text-theme-text-tertiary">Manage production batches and workflow</p>
      </div>

      {/* Top Level Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
        <Link href="/batch-management/assignment">
          <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <Package className="h-12 w-12 text-theme-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-theme-text-secondary mb-2">Batch Assignment</h3>
              <p className="text-theme-text-tertiary mb-4">Assign workers to batches</p>
              <div className="space-y-2 text-sm text-theme-text-tertiary">
                <div>• Auto-assignment</div>
                <div>• Skill matching</div>
                <div>• Availability check</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/batch-management/workflow">
          <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer h-full">
            <CardContent className="p-6 text-center">
              <GitBranch className="h-12 w-12 text-theme-text-secondary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-theme-text-secondary mb-2">Production Workflow</h3>
              <p className="text-theme-text-tertiary mb-4">Visual production pipeline</p>
              <div className="space-y-2 text-sm text-theme-text-tertiary">
                <div>• Drag & drop batches</div>
                <div>• Stage tracking</div>
                <div>• Progress monitoring</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/production/calendar">
          <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer h-full">
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
        </Link>

        <Link href="/batch-management/subassembly">
          <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer h-full">
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
        </Link>

        <Link href="/management/workers">
          <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer h-full">
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
        </Link>
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