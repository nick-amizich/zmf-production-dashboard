"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, Users, Package, AlertCircle, CheckCircle } from "lucide-react"

interface ProductionBatch {
  batchNumber: string
  model: string
  quantity: number
  currentStage: string
  priority: "standard" | "rush"
  estimatedTime: number
  assignedWorkers: string[]
  status: "ready-for-production" | "in-progress" | "completed"
  technicianNotes?: string
  referenceImages: string[]
  createdAt: string
  shopifyOrders: string[]
}

interface ProductionQueueProps {
  batches: ProductionBatch[]
  onAssignWorker: (batchNumber: string, worker: string) => void
  onStartBatch: (batchNumber: string) => void
}

const mockBatches: ProductionBatch[] = [
  {
    batchNumber: "SPEC-2024-042",
    model: "Verite Closed",
    quantity: 4,
    currentStage: "intake",
    priority: "standard",
    estimatedTime: 32,
    assignedWorkers: ["Tony Martinez"],
    status: "ready-for-production",
    technicianNotes: "Use cup set from shelf B-3. Pay special attention to grain direction.",
    referenceImages: ["/placeholder.svg?height=100&width=100"],
    createdAt: "2024-01-15T10:30:00Z",
    shopifyOrders: ["ZMF-2024-0157", "ZMF-2024-0158", "ZMF-2024-0159", "ZMF-2024-0160"],
  },
  {
    batchNumber: "SPEC-2024-041",
    model: "Caldera Open",
    quantity: 2,
    currentStage: "finishing",
    priority: "rush",
    estimatedTime: 24,
    assignedWorkers: ["Kevin Chen"],
    status: "in-progress",
    technicianNotes: "Premium Cocobolo finish - extra care required.",
    referenceImages: [],
    createdAt: "2024-01-14T14:20:00Z",
    shopifyOrders: ["ZMF-2024-0155", "ZMF-2024-0156"],
  },
]

export function ProductionQueue({ batches = mockBatches, onAssignWorker, onStartBatch }: ProductionQueueProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready-for-production":
        return <Package className="h-4 w-4" />
      case "in-progress":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready-for-production":
        return "bg-theme-status-info"
      case "in-progress":
        return "bg-theme-status-warning"
      case "completed":
        return "bg-theme-status-success"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-theme-text-secondary">Production Queue</h2>
        <Badge className="bg-theme-brand-secondary">{batches.length} active batches</Badge>
      </div>

      {batches.map((batch) => (
        <Card key={batch.batchNumber} className="bg-theme-bg-secondary border-theme-border-primary">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-theme-text-secondary flex items-center gap-2">
                {getStatusIcon(batch.status)}
                Batch {batch.batchNumber}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={batch.priority === "rush" ? "bg-theme-status-error" : "bg-theme-status-info"}>
                  {batch.priority.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(batch.status)}>{batch.status.replace("-", " ").toUpperCase()}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-theme-text-tertiary text-sm">Model</div>
                <div className="text-theme-text-primary font-medium">{batch.model}</div>
              </div>
              <div>
                <div className="text-theme-text-tertiary text-sm">Quantity</div>
                <div className="text-theme-text-primary font-medium">{batch.quantity} headphones</div>
              </div>
              <div>
                <div className="text-theme-text-tertiary text-sm">Current Stage</div>
                <div className="text-theme-text-primary font-medium capitalize">{batch.currentStage.replace("-", " ")}</div>
              </div>
              <div>
                <div className="text-theme-text-tertiary text-sm">Est. Time</div>
                <div className="text-theme-text-primary font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {batch.estimatedTime}h
                </div>
              </div>
            </div>

            {batch.technicianNotes && (
              <div className="p-3 bg-theme-bg-primary rounded border border-theme-border-secondary">
                <div className="text-theme-text-secondary text-sm font-medium mb-1">Technician Notes:</div>
                <div className="text-theme-text-primary text-sm">{batch.technicianNotes}</div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-theme-text-tertiary" />
                  <span className="text-theme-text-tertiary text-sm">
                    {batch.assignedWorkers.length > 0 ? batch.assignedWorkers.join(", ") : "Unassigned"}
                  </span>
                </div>
                {batch.referenceImages.length > 0 && (
                  <Badge className="bg-theme-status-success">{batch.referenceImages.length} reference images</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-theme-text-tertiary">{batch.shopifyOrders.length} Shopify orders created</div>
                {batch.status === "ready-for-production" && (
                  <Button
                    onClick={() => onStartBatch(batch.batchNumber)}
                    className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
                    size="sm"
                  >
                    Start Production
                  </Button>
                )}
              </div>
            </div>

            {/* Shopify Orders List */}
            <div className="border-t border-theme-border-secondary pt-3">
              <div className="text-theme-text-tertiary text-sm mb-2">Shopify Orders:</div>
              <div className="flex flex-wrap gap-2">
                {batch.shopifyOrders.map((orderNumber) => (
                  <Badge key={orderNumber} className="bg-theme-status-info text-xs">
                    {orderNumber}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
