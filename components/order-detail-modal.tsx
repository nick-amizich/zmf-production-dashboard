"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, MapPin, MessageSquare, Truck, CheckCircle, AlertTriangle } from "lucide-react"

interface OrderDetailModalProps {
  isOpen: boolean
  onClose: () => void
  order: any // You would type this properly based on your order structure
}

export function OrderDetailModal({ isOpen, onClose, order }: OrderDetailModalProps) {
  if (!order) return null

  const productionStages = [
    { name: "Intake", status: "completed", duration: "45m", worker: "Tony Martinez" },
    { name: "Sanding", status: "completed", duration: "1h 20m", worker: "Jake Thompson" },
    { name: "Finishing", status: "in-progress", duration: "2h 15m", worker: "Kevin Chen" },
    { name: "Sub-Assembly", status: "pending", duration: "-", worker: "Sam Rodriguez" },
    { name: "Final Assembly", status: "pending", duration: "-", worker: "Jake Thompson" },
    { name: "Acoustic QC", status: "pending", duration: "-", worker: "Matt Wilson" },
    { name: "Shipping", status: "pending", duration: "-", worker: "Laura Davis" },
  ]

  const qualityCheckpoints = [
    {
      stage: "Intake",
      status: "passed",
      notes: "Wood grain matched perfectly, grade A quality",
      timestamp: "2024-01-15 09:30",
      worker: "Tony Martinez",
    },
    {
      stage: "Sanding",
      status: "passed",
      notes: "Surface preparation completed to specification",
      timestamp: "2024-01-15 11:45",
      worker: "Jake Thompson",
    },
    {
      stage: "Finishing",
      status: "in-progress",
      notes: "First coat applied, drying in progress",
      timestamp: "2024-01-15 14:20",
      worker: "Kevin Chen",
    },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-theme-text-secondary text-xl">{order.orderNumber} - Order Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Order Info */}
          <div className="space-y-4">
            {/* Customer Information */}
            <Card className="bg-theme-bg-primary border-theme-border-secondary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-sm">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-theme-text-secondary" />
                  <span className="text-theme-text-primary">{order.customerName}</span>
                </div>
                <div className="text-theme-text-tertiary">{order.customerEmail}</div>
                <div className="flex items-start gap-2 mt-3">
                  <MapPin className="h-4 w-4 text-theme-text-secondary mt-0.5" />
                  <div className="text-theme-text-tertiary">
                    <div>123 Main Street</div>
                    <div>Chicago, IL 60601</div>
                    <div>United States</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Specifications */}
            <Card className="bg-theme-bg-primary border-theme-border-secondary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-sm">Product Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Model:</span>
                  <span className="text-theme-text-primary">{order.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Wood Type:</span>
                  <span className="text-theme-text-primary">{order.woodType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Grille Color:</span>
                  <span className="text-theme-text-primary">Black</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Chassis:</span>
                  <span className="text-theme-text-primary">Aluminum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Pads:</span>
                  <span className="text-theme-text-primary">Universe Perforated</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card className="bg-theme-bg-primary border-theme-border-secondary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-sm">Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-tertiary">Status:</span>
                  <Badge className="bg-theme-status-info text-theme-text-primary">{order.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-theme-text-tertiary">Priority:</span>
                  <Badge className={`${order.priority === "urgent" ? "bg-theme-status-error" : "bg-theme-status-warning"} text-theme-text-primary`}>
                    {order.priority}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-theme-text-tertiary">Progress:</span>
                    <span className="text-theme-text-secondary">{order.progress}%</span>
                  </div>
                  <Progress value={order.progress} className="h-2" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-theme-text-tertiary">Due Date:</span>
                  <span className="text-theme-text-primary">{order.dueDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-theme-text-tertiary">Est. Completion:</span>
                  <span className="text-theme-text-primary">{order.estimatedCompletion}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Production Timeline */}
          <div className="space-y-4">
            <Card className="bg-theme-bg-primary border-theme-border-secondary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-sm">Production Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {productionStages.map((stage, index) => (
                  <div key={stage.name} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          stage.status === "completed"
                            ? "bg-theme-status-success"
                            : stage.status === "in-progress"
                              ? "bg-theme-status-info"
                              : "bg-gray-500"
                        }`}
                      />
                      {index < productionStages.length - 1 && <div className="w-0.5 h-8 bg-gray-600 mt-1" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-theme-text-primary font-medium">{stage.name}</span>
                        <span className="text-xs text-theme-text-tertiary">{stage.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-theme-text-tertiary">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="bg-theme-brand-secondary text-theme-text-secondary text-xs">
                            {stage.worker
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span>{stage.worker}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Communication Log */}
            <Card className="bg-theme-bg-primary border-theme-border-secondary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-sm">Communication Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-xs text-theme-text-tertiary">2024-01-15 10:30</div>
                  <div className="text-sm text-theme-text-primary">Order confirmed and entered into production queue</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-theme-text-tertiary">2024-01-15 14:45</div>
                  <div className="text-sm text-theme-text-primary">Customer notified of production start</div>
                </div>
                <div className="mt-4">
                  <Textarea
                    placeholder="Add a note or communication..."
                    className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary placeholder-gray-400"
                    rows={3}
                  />
                  <Button className="mt-2 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary" size="sm">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quality & Shipping */}
          <div className="space-y-4">
            {/* Quality Checkpoints */}
            <Card className="bg-theme-bg-primary border-theme-border-secondary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-sm">Quality Checkpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {qualityCheckpoints.map((checkpoint) => (
                  <div key={checkpoint.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-theme-text-primary font-medium">{checkpoint.stage}</span>
                      <div className="flex items-center gap-1">
                        {checkpoint.status === "passed" ? (
                          <CheckCircle className="h-4 w-4 text-theme-status-success" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-theme-status-warning" />
                        )}
                        <span
                          className={`text-xs ${checkpoint.status === "passed" ? "text-theme-status-success" : "text-theme-status-warning"}`}
                        >
                          {checkpoint.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-theme-text-tertiary">{checkpoint.notes}</div>
                    <div className="text-xs text-theme-text-tertiary">
                      {checkpoint.timestamp} - {checkpoint.worker}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="bg-theme-bg-primary border-theme-border-secondary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary text-sm">Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-theme-text-secondary" />
                  <span className="text-theme-text-tertiary">Shipping Method:</span>
                  <span className="text-theme-text-primary">FedEx Express</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Tracking Number:</span>
                  <span className="text-theme-text-primary">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Ship Date:</span>
                  <span className="text-theme-text-primary">Pending</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-theme-text-tertiary">Delivery Est.:</span>
                  <span className="text-theme-text-primary">-</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">Update Status</Button>
              <Button variant="outline" className="w-full border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20">
                Send Customer Update
              </Button>
              <Button variant="outline" className="w-full border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20">
                Print Order Sheet
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
