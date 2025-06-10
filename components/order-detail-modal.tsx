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
      <DialogContent className="max-w-6xl max-h-[90vh] bg-[#1a0d08] border-[#8B4513]/30 text-white overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#d4a574] text-xl">{order.orderNumber} - Order Details</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-6">
          {/* Left Column - Order Info */}
          <div className="space-y-4">
            {/* Customer Information */}
            <Card className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-sm">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-[#d4a574]" />
                  <span className="text-white">{order.customerName}</span>
                </div>
                <div className="text-gray-300">{order.customerEmail}</div>
                <div className="flex items-start gap-2 mt-3">
                  <MapPin className="h-4 w-4 text-[#d4a574] mt-0.5" />
                  <div className="text-gray-300">
                    <div>123 Main Street</div>
                    <div>Chicago, IL 60601</div>
                    <div>United States</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Product Specifications */}
            <Card className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-sm">Product Specifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Model:</span>
                  <span className="text-white">{order.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Wood Type:</span>
                  <span className="text-white">{order.woodType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Grille Color:</span>
                  <span className="text-white">Black</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chassis:</span>
                  <span className="text-white">Aluminum</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Pads:</span>
                  <span className="text-white">Universe Perforated</span>
                </div>
              </CardContent>
            </Card>

            {/* Order Status */}
            <Card className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-sm">Order Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status:</span>
                  <Badge className="bg-blue-600 text-white">{order.status}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Priority:</span>
                  <Badge className={`${order.priority === "urgent" ? "bg-red-600" : "bg-amber-600"} text-white`}>
                    {order.priority}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress:</span>
                    <span className="text-[#d4a574]">{order.progress}%</span>
                  </div>
                  <Progress value={order.progress} className="h-2" />
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Due Date:</span>
                  <span className="text-white">{order.dueDate}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Est. Completion:</span>
                  <span className="text-white">{order.estimatedCompletion}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - Production Timeline */}
          <div className="space-y-4">
            <Card className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-sm">Production Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {productionStages.map((stage, index) => (
                  <div key={stage.name} className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          stage.status === "completed"
                            ? "bg-green-500"
                            : stage.status === "in-progress"
                              ? "bg-blue-500"
                              : "bg-gray-500"
                        }`}
                      />
                      {index < productionStages.length - 1 && <div className="w-0.5 h-8 bg-gray-600 mt-1" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-white font-medium">{stage.name}</span>
                        <span className="text-xs text-gray-400">{stage.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Avatar className="h-4 w-4">
                          <AvatarFallback className="bg-[#8B4513] text-[#d4a574] text-xs">
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
            <Card className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-sm">Communication Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">2024-01-15 10:30</div>
                  <div className="text-sm text-white">Order confirmed and entered into production queue</div>
                </div>
                <div className="space-y-2">
                  <div className="text-xs text-gray-400">2024-01-15 14:45</div>
                  <div className="text-sm text-white">Customer notified of production start</div>
                </div>
                <div className="mt-4">
                  <Textarea
                    placeholder="Add a note or communication..."
                    className="bg-[#1a0d08] border-[#8B4513]/30 text-white placeholder-gray-400"
                    rows={3}
                  />
                  <Button className="mt-2 bg-[#8B4513] hover:bg-[#8B4513]/80 text-white" size="sm">
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
            <Card className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-sm">Quality Checkpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {qualityCheckpoints.map((checkpoint) => (
                  <div key={checkpoint.stage} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium">{checkpoint.stage}</span>
                      <div className="flex items-center gap-1">
                        {checkpoint.status === "passed" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                        <span
                          className={`text-xs ${checkpoint.status === "passed" ? "text-green-500" : "text-amber-500"}`}
                        >
                          {checkpoint.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{checkpoint.notes}</div>
                    <div className="text-xs text-gray-500">
                      {checkpoint.timestamp} - {checkpoint.worker}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Information */}
            <Card className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardHeader>
                <CardTitle className="text-[#d4a574] text-sm">Shipping Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[#d4a574]" />
                  <span className="text-gray-400">Shipping Method:</span>
                  <span className="text-white">FedEx Express</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tracking Number:</span>
                  <span className="text-white">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ship Date:</span>
                  <span className="text-white">Pending</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Est.:</span>
                  <span className="text-white">-</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-2">
              <Button className="w-full bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">Update Status</Button>
              <Button variant="outline" className="w-full border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
                Send Customer Update
              </Button>
              <Button variant="outline" className="w-full border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
                Print Order Sheet
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
