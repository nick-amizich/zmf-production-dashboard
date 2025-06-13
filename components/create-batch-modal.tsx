"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { X, AlertCircle, CheckCircle, Package } from "lucide-react"

interface Order {
  id: string
  orderNumber: string
  customerName: string
  model: string
  woodType: string
  priority: "normal" | "high" | "urgent"
  dueDate: string
}

interface CreateBatchModalProps {
  isOpen: boolean
  onClose: () => void
  availableOrders: Order[]
  workers: string[]
  onCreateBatch: (batch: any) => void
}

export function CreateBatchModal({ isOpen, onClose, availableOrders, workers, onCreateBatch }: CreateBatchModalProps) {
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([])
  const [assignedWorker, setAssignedWorker] = useState("")
  const [batchNotes, setBatchNotes] = useState("")

  const addOrderToBatch = (order: Order) => {
    if (selectedOrders.length < 12 && !selectedOrders.find((o) => o.id === order.id)) {
      setSelectedOrders([...selectedOrders, order])
    }
  }

  const removeOrderFromBatch = (orderId: string) => {
    setSelectedOrders(selectedOrders.filter((o) => o.id !== orderId))
  }

  const getEfficiencyScore = () => {
    if (selectedOrders.length === 0) return 0

    const models = new Set(selectedOrders.map((o) => o.model))
    const woods = new Set(selectedOrders.map((o) => o.woodType))

    let score = 100
    if (models.size > 1) score -= 20 // Mixed models penalty
    if (woods.size > 1) score -= 15 // Mixed woods penalty
    if (selectedOrders.length < 2) score -= 30 // Too small batch
    if (selectedOrders.length > 8) score -= 10 // Large batch complexity

    return Math.max(0, score)
  }

  const getRecommendations = () => {
    const recommendations = []
    const models = new Set(selectedOrders.map((o) => o.model))
    const woods = new Set(selectedOrders.map((o) => o.woodType))

    if (selectedOrders.length === 0) {
      recommendations.push("Select 2-12 orders to create a batch")
    } else {
      if (selectedOrders.length === 1) {
        recommendations.push("Add at least one more order for efficiency")
      }
      if (models.size > 1) {
        recommendations.push("Consider grouping same models for better efficiency")
      }
      if (woods.size > 1) {
        recommendations.push("Mixed wood types may require extra setup time")
      }
      if (selectedOrders.length > 8) {
        recommendations.push("Large batches may be harder to manage")
      }
    }

    return recommendations
  }

  const handleCreateBatch = () => {
    if (selectedOrders.length === 0 || !assignedWorker) return

    const newBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: `BATCH-2024-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      headphoneCount: selectedOrders.length,
      modelConsistency: new Set(selectedOrders.map((o) => o.model)).size === 1 ? "uniform" : "mixed",
      primaryModel: selectedOrders[0].model,
      woodTypes: Array.from(new Set(selectedOrders.map((o) => o.woodType))),
      assignedWorker,
      timeInStage: "0m",
      qualityStatus: "good" as const,
      progress: 0,
      orders: selectedOrders,
      estimatedCompletion: "2-3 hours",
      priority: selectedOrders.some((o) => o.priority === "urgent")
        ? "urgent"
        : selectedOrders.some((o) => o.priority === "high")
          ? "high"
          : "normal",
      notes: batchNotes,
    }

    onCreateBatch(newBatch)
    setSelectedOrders([])
    setAssignedWorker("")
    setBatchNotes("")
    onClose()
  }

  const efficiencyScore = getEfficiencyScore()
  const recommendations = getRecommendations()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-theme-text-secondary text-xl">Create New Batch</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6 h-[70vh]">
          {/* Available Orders */}
          <div className="space-y-4">
            <h3 className="text-theme-text-secondary font-semibold">Available Orders</h3>
            <div className="space-y-2 overflow-y-auto h-full">
              {availableOrders.map((order) => (
                <Card
                  key={order.id}
                  className="bg-theme-bg-primary border-theme-border-secondary cursor-pointer hover:border-theme-text-secondary/50 transition-colors"
                >
                  <CardContent className="p-3" onClick={() => addOrderToBatch(order)}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-theme-text-secondary text-sm font-medium">{order.orderNumber}</span>
                      {order.priority !== "normal" && (
                        <Badge className={`text-xs ${order.priority === "urgent" ? "bg-theme-status-error" : "bg-theme-status-warning"}`}>
                          {order.priority}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs space-y-1">
                      <div className="text-theme-text-tertiary">{order.customerName}</div>
                      <div className="text-theme-text-primary">{order.model}</div>
                      <div className="text-theme-text-tertiary">{order.woodType}</div>
                      <div className="text-theme-text-tertiary">Due: {order.dueDate}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Batch Builder */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-theme-text-secondary font-semibold">Batch Orders</h3>
              <Badge className="bg-theme-brand-secondary text-theme-text-primary">{selectedOrders.length}/12 orders</Badge>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1">
              {selectedOrders.map((order) => (
                <Card key={order.id} className="bg-theme-bg-primary border-theme-border-secondary">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-theme-text-secondary text-sm font-medium">{order.orderNumber}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOrderFromBatch(order.id)}
                            className="h-6 w-6 p-0 text-theme-status-error hover:text-red-300"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-xs space-y-1">
                          <div className="text-theme-text-primary">{order.model}</div>
                          <div className="text-theme-text-tertiary">{order.woodType}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {selectedOrders.length === 0 && (
                <div className="text-center text-theme-text-tertiary py-8">
                  <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Drag orders here to create a batch</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-theme-text-secondary">Assign Worker</Label>
                <Select value={assignedWorker} onValueChange={setAssignedWorker}>
                  <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                    <SelectValue placeholder="Select worker" />
                  </SelectTrigger>
                  <SelectContent className="bg-theme-bg-secondary border-theme-border-primary">
                    {workers.map((worker) => (
                      <SelectItem key={worker} value={worker} className="text-theme-text-primary hover:bg-theme-brand-secondary/20">
                        {worker}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-theme-text-secondary">Batch Notes</Label>
                <Textarea
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="Special instructions or notes..."
                  className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Efficiency Analysis */}
          <div className="space-y-4">
            <h3 className="text-theme-text-secondary font-semibold">Batch Analysis</h3>

            <Card className="bg-theme-bg-primary border-theme-border-secondary">
              <CardContent className="p-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-theme-text-secondary mb-1">{efficiencyScore}%</div>
                  <div className="text-sm text-theme-text-tertiary">Efficiency Score</div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-text-tertiary">Batch Size:</span>
                    <span className="text-theme-text-primary">{selectedOrders.length} units</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-text-tertiary">Models:</span>
                    <span className="text-theme-text-primary">{new Set(selectedOrders.map((o) => o.model)).size || 0} types</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-text-tertiary">Wood Types:</span>
                    <span className="text-theme-text-primary">{new Set(selectedOrders.map((o) => o.woodType)).size || 0} types</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-theme-bg-primary border-theme-border-secondary">
              <CardContent className="p-4">
                <h4 className="text-theme-text-secondary text-sm font-medium mb-3">Recommendations</h4>
                <div className="space-y-2">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-xs">
                      {efficiencyScore >= 80 ? (
                        <CheckCircle className="h-3 w-3 text-theme-status-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-theme-status-warning mt-0.5 flex-shrink-0" />
                      )}
                      <span className="text-theme-text-tertiary">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={onClose} className="flex-1 bg-gray-600 hover:bg-gray-700 text-theme-text-primary">
                Cancel
              </Button>
              <Button
                onClick={handleCreateBatch}
                disabled={selectedOrders.length === 0 || !assignedWorker}
                className="flex-1 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary disabled:opacity-50"
              >
                Create Batch
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
