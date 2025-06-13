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
    "in-production": "bg-theme-status-info",
    "quality-hold": "bg-theme-status-warning",
    completed: "bg-theme-status-success",
    shipped: "bg-purple-600",
  }

  const priorityColors = {
    normal: "border-theme-border-primary",
    high: "border-theme-status-warning/50",
    urgent: "border-theme-status-error/50",
  }

  const qualityColors = {
    good: "text-theme-status-success",
    warning: "text-theme-status-warning",
    critical: "text-theme-status-error",
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
    <Card className={`bg-theme-bg-secondary ${priorityColors[order.priority]} hover:border-theme-text-secondary/50 transition-colors`}>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div>
                <h3 className="font-semibold text-theme-text-secondary">{order.orderNumber}</h3>
                <p className="text-sm text-theme-text-tertiary flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {order.customerName}
                </p>
              </div>
              {order.priority !== "normal" && (
                <Badge className={`${order.priority === "urgent" ? "bg-theme-status-error" : "bg-theme-status-warning"} text-theme-text-primary`}>
                  {order.priority}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${statusColors[order.status]} text-theme-text-primary`}>{order.status.replace("-", " ")}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails(order.id)}
                className="text-theme-text-secondary hover:text-theme-text-secondary/80"
              >
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Product Details */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-theme-text-tertiary">Model:</span>
              <p className="text-theme-text-primary font-medium">{order.model}</p>
            </div>
            <div>
              <span className="text-theme-text-tertiary">Wood:</span>
              <p className="text-theme-text-primary">{order.woodType}</p>
            </div>
            <div>
              <span className="text-theme-text-tertiary">Stage:</span>
              <p className="text-theme-text-secondary">{order.currentStage}</p>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-theme-text-tertiary">Production Progress</span>
              <span className="text-theme-text-secondary">{order.progress}%</span>
            </div>
            <Progress value={order.progress} className="h-2 bg-theme-brand-secondary/20" />
          </div>

          {/* Additional Info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              {order.assignedWorker && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarFallback className="bg-theme-brand-secondary text-theme-text-secondary text-xs">
                      {order.assignedWorker
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-theme-text-tertiary">{order.assignedWorker}</span>
                </div>
              )}
              {order.batchId && (
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3 text-theme-text-tertiary" />
                  <span className="text-theme-text-tertiary">{order.batchId}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-theme-text-tertiary" />
                <span className="text-theme-text-tertiary">Due: {order.dueDate}</span>
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
