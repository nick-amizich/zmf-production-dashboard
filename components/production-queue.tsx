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
        return "bg-blue-600"
      case "in-progress":
        return "bg-amber-600"
      case "completed":
        return "bg-green-600"
      default:
        return "bg-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#d4a574]">Production Queue</h2>
        <Badge className="bg-[#8B4513]">{batches.length} active batches</Badge>
      </div>

      {batches.map((batch) => (
        <Card key={batch.batchNumber} className="bg-[#1a0d08] border-[#8B4513]/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#d4a574] flex items-center gap-2">
                {getStatusIcon(batch.status)}
                Batch {batch.batchNumber}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={batch.priority === "rush" ? "bg-red-600" : "bg-blue-600"}>
                  {batch.priority.toUpperCase()}
                </Badge>
                <Badge className={getStatusColor(batch.status)}>{batch.status.replace("-", " ").toUpperCase()}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-gray-400 text-sm">Model</div>
                <div className="text-white font-medium">{batch.model}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Quantity</div>
                <div className="text-white font-medium">{batch.quantity} headphones</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Current Stage</div>
                <div className="text-white font-medium capitalize">{batch.currentStage.replace("-", " ")}</div>
              </div>
              <div>
                <div className="text-gray-400 text-sm">Est. Time</div>
                <div className="text-white font-medium flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {batch.estimatedTime}h
                </div>
              </div>
            </div>

            {batch.technicianNotes && (
              <div className="p-3 bg-[#0a0a0a] rounded border border-[#8B4513]/20">
                <div className="text-[#d4a574] text-sm font-medium mb-1">Technician Notes:</div>
                <div className="text-white text-sm">{batch.technicianNotes}</div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">
                    {batch.assignedWorkers.length > 0 ? batch.assignedWorkers.join(", ") : "Unassigned"}
                  </span>
                </div>
                {batch.referenceImages.length > 0 && (
                  <Badge className="bg-green-600">{batch.referenceImages.length} reference images</Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="text-xs text-gray-400">{batch.shopifyOrders.length} Shopify orders created</div>
                {batch.status === "ready-for-production" && (
                  <Button
                    onClick={() => onStartBatch(batch.batchNumber)}
                    className="bg-[#8B4513] hover:bg-[#8B4513]/80"
                    size="sm"
                  >
                    Start Production
                  </Button>
                )}
              </div>
            </div>

            {/* Shopify Orders List */}
            <div className="border-t border-[#8B4513]/20 pt-3">
              <div className="text-gray-400 text-sm mb-2">Shopify Orders:</div>
              <div className="flex flex-wrap gap-2">
                {batch.shopifyOrders.map((orderNumber) => (
                  <Badge key={orderNumber} className="bg-blue-600 text-xs">
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
