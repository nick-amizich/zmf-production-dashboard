"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BatchCard } from "./batch-card"
import { AlertTriangle, Clock } from "lucide-react"

interface Batch {
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
  orders: any[]
  estimatedCompletion: string
  priority: "normal" | "high" | "urgent"
}

interface StageColumnProps {
  stage: {
    id: string
    name: string
    description: string
    averageTime: string
    bottleneck: boolean
  }
  batches: Batch[]
  onDrop: (e: React.DragEvent, stageId: string) => void
  onDragOver: (e: React.DragEvent) => void
  onDragStart: (e: React.DragEvent, batchId: string) => void
}

export function StageColumn({ stage, batches, onDrop, onDragOver, onDragStart }: StageColumnProps) {
  const totalUnits = batches.reduce((sum, batch) => sum + batch.headphoneCount, 0)
  const hasQualityIssues = batches.some((batch) => batch.qualityStatus === "critical" || batch.qualityStatus === "hold")

  return (
    <div className="flex-1 min-w-[280px]">
      <Card className="bg-theme-bg-secondary border-theme-border-primary h-full">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-theme-text-secondary text-lg">{stage.name}</CardTitle>
              <p className="text-sm text-theme-text-tertiary">{stage.description}</p>
            </div>
            {stage.bottleneck && <AlertTriangle className="h-5 w-5 text-theme-status-warning" />}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="border-theme-border-active text-theme-text-secondary">
                {batches.length} batches
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="border-theme-border-active text-theme-text-secondary">
                {totalUnits} units
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-theme-text-tertiary">
              <Clock className="h-3 w-3" />
              <span>{stage.averageTime} avg</span>
            </div>
          </div>

          {hasQualityIssues && (
            <div className="flex items-center gap-1 text-theme-status-warning text-xs">
              <AlertTriangle className="h-3 w-3" />
              <span>Quality issues detected</span>
            </div>
          )}
        </CardHeader>

        <CardContent
          className="space-y-3 min-h-[600px] max-h-[600px] overflow-y-auto"
          onDrop={(e) => onDrop(e, stage.id)}
          onDragOver={onDragOver}
        >
          {batches.map((batch) => (
            <BatchCard key={batch.id} batch={batch} stage={stage.name} onDragStart={onDragStart} />
          ))}

          {batches.length === 0 && (
            <div className="text-center text-theme-text-tertiary py-8">
              <p>No batches in this stage</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
