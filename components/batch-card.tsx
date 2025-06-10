"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Clock, Package, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, XCircle, GripVertical } from "lucide-react"

interface Order {
  id: string
  orderNumber: string
  customerName: string
  model: string
  woodType: string
  qualityStatus: "good" | "warning" | "critical"
}

interface BatchCardProps {
  batch: {
    id: string
    batchNumber: string
    headphoneCount: number
    modelConsistency: "uniform" | "mixed"
    primaryModel?: string
    woodTypes: string[]
    assignedWorker: string
    timeInStage: string
    qualityStatus: "good" | "warning" | "critical" | "hold"
    progress: number
    orders: Order[]
    estimatedCompletion: string
    priority: "normal" | "high" | "urgent"
  }
  stage: string
  onDragStart?: (e: React.DragEvent, batchId: string) => void
}

export function BatchCard({ batch, stage, onDragStart }: BatchCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const qualityColors = {
    good: "bg-green-600",
    warning: "bg-amber-600",
    critical: "bg-red-600",
    hold: "bg-purple-600",
  }

  const priorityColors = {
    normal: "border-[#8B4513]/30",
    high: "border-amber-500/50",
    urgent: "border-red-500/50",
  }

  const qualityIcons = {
    good: CheckCircle,
    warning: AlertTriangle,
    critical: XCircle,
    hold: Clock,
  }

  const QualityIcon = qualityIcons[batch.qualityStatus]

  return (
    <Card
      className={`bg-[#1a0d08] ${priorityColors[batch.priority]} hover:border-[#d4a574]/50 transition-all cursor-move group mb-3`}
      draggable
      onDragStart={(e) => onDragStart?.(e, batch.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-[#8B4513] opacity-50 group-hover:opacity-100" />
            <div>
              <h3 className="font-semibold text-[#d4a574] text-sm">{batch.batchNumber}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Package className="h-3 w-3" />
                {batch.headphoneCount} units
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${qualityColors[batch.qualityStatus]}`} />
            {batch.priority !== "normal" && (
              <Badge className={`text-xs ${batch.priority === "urgent" ? "bg-red-600" : "bg-amber-600"}`}>
                {batch.priority}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Model:</span>
            <span className="text-white">{batch.modelConsistency === "uniform" ? batch.primaryModel : "Mixed"}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Wood:</span>
            <span className="text-white">
              {batch.woodTypes.length === 1 ? batch.woodTypes[0] : `${batch.woodTypes.length} types`}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Worker:</span>
            <div className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarFallback className="bg-[#8B4513] text-[#d4a574] text-xs">
                  {batch.assignedWorker
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <span className="text-white">{batch.assignedWorker}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Time in stage:</span>
            <span className="text-[#d4a574]">{batch.timeInStage}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Progress</span>
            <span className="text-[#d4a574]">{batch.progress}%</span>
          </div>
          <Progress value={batch.progress} className="h-2 bg-[#8B4513]/20" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <QualityIcon className="h-3 w-3" />
            <span className="capitalize">{batch.qualityStatus}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-6 w-6 p-0 text-[#8B4513] hover:text-[#d4a574]"
          >
            {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>
        </div>

        {isExpanded && (
          <div className="border-t border-[#8B4513]/30 pt-3 space-y-2">
            <div className="text-xs text-gray-400 mb-2">Orders in batch:</div>
            {batch.orders.map((order) => (
              <div key={order.id} className="bg-[#0a0a0a] p-2 rounded text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#d4a574]">{order.orderNumber}</span>
                  <div className={`w-2 h-2 rounded-full ${qualityColors[order.qualityStatus]}`} />
                </div>
                <div className="text-gray-400">{order.customerName}</div>
                <div className="text-white">
                  {order.model} - {order.woodType}
                </div>
              </div>
            ))}
            <div className="text-xs text-gray-400 mt-2">Est. completion: {batch.estimatedCompletion}</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
