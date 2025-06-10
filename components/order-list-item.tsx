"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, User, Package, AlertTriangle, CheckCircle, Eye } from "lucide-react"

interface Order {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  model: string
  woodType: string
  currentStage: string
  status: "pending" | "in-production" | "quality-hold" | "completed" | "shipped"
  progress: number
  priority: "normal" | "high" | "urgent"
  dueDate: string
  createdDate: string
  assignedWorker?: string
  batchId?: string
  estimatedCompletion: string
  qualityStatus: "good" | "warning" | "critical"
}

interface OrderListItemProps {
  order: Order
  onViewDetails: (orderId: string) => void
}

export function OrderListItem({ order, onViewDetails }: OrderListItemProps) {
  const statusColors = {
    pending: "bg-gray-600",
    "in-production": "bg-blue-600",
    "quality-hold": "bg-amber-600",
    completed: "bg-green-600",
    shipped: "bg-purple-600",
  }

  const priorityColors = {
    normal: "border-[#8B4513]/30",
    high: "border-amber-500/50",
    urgent: "border-red-500/50",
  }

  const qualityColors = {
    good: "text-green-400",
    warning: "text-amber-400",
    critical: "text-red-400",
  }

  const getStageProgress = (stage: string) => {
    const stages = [
      "Pending",
      "Intake",
      "Sanding",
      "Finishing",
      "Sub-Assembly",
      "Final Assembly",
      "Acoustic QC",
      "Shipping",
    ]
    const currentIndex = stages.indexOf(stage)
    return currentIndex >= 0 ? ((currentIndex + 1) / stages.length) * 100 : 0
  }

  return (
    <Card className={`bg-[#1a0d08] ${priorityColors[order.priority]} hover:border-[#d4a574]/50 transition-colors`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-[#d4a574]">{order.orderNumber}</h3>
                <p className="text-sm text-gray-300 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {order.customerName}
                </p>
              </div>
              {order.priority !== "normal" && (
                <Badge className={`${order.priority === "urgent" ? "bg-red-600" : "bg-amber-600"} text-white`}>
                  {order.priority}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusColors[order.status]} text-white`}>{order.status.replace("-", " ")}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(order.id)}
                className="text-[#d4a574] hover:text-[#d4a574]/80"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Model:</span>
              <p className="text-white font-medium">{order.model}</p>
            </div>
            <div>
              <span className="text-gray-400">Wood:</span>
              <p className="text-white">{order.woodType}</p>
            </div>
            <div>
              <span className="text-gray-400">Stage:</span>
              <p className="text-[#d4a574]">{order.currentStage}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Production Progress</span>
              <span className="text-[#d4a574]">{order.progress}%</span>
            </div>
            <Progress value={order.progress} className="h-2 bg-[#8B4513]/20" />
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              {order.assignedWorker && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="bg-[#8B4513] text-[#d4a574] text-xs">
                      {order.assignedWorker
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-gray-300">{order.assignedWorker}</span>
                </div>
              )}
              {order.batchId && (
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-gray-400" />
                  <span className="text-gray-300">{order.batchId}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-gray-300">Due: {order.dueDate}</span>
              </div>
              <div className={`flex items-center gap-1 ${qualityColors[order.qualityStatus]}`}>
                {order.qualityStatus === "good" && <CheckCircle className="h-3 w-3" />}
                {order.qualityStatus === "warning" && <AlertTriangle className="h-3 w-3" />}
                {order.qualityStatus === "critical" && <AlertTriangle className="h-3 w-3" />}
                <span className="capitalize">{order.qualityStatus}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
