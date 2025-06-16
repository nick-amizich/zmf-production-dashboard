"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface WorkflowViewProps {
  onBack: () => void
}

interface RecentBatch {
  id: string
  batchNumber: string
  headphoneCount: number
  model: string
  woodType: string
  currentStage: string
  readyForSanding: boolean
  estimatedSandingTime: string
}

const recentBatches: RecentBatch[] = [
  {
    id: "1",
    batchNumber: "BATCH-2024-001",
    headphoneCount: 4,
    model: "Verite Closed",
    woodType: "Sapele",
    currentStage: "intake",
    readyForSanding: true,
    estimatedSandingTime: "2.5h",
  },
  {
    id: "2",
    batchNumber: "BATCH-2024-003",
    headphoneCount: 6,
    model: "Auteur",
    woodType: "Cherry",
    currentStage: "intake",
    readyForSanding: true,
    estimatedSandingTime: "3.0h",
  },
  {
    id: "3",
    batchNumber: "BATCH-2024-005",
    headphoneCount: 2,
    model: "Caldera Open",
    woodType: "Cocobolo",
    currentStage: "intake",
    readyForSanding: false,
    estimatedSandingTime: "1.5h",
  },
]

export default function WorkflowView({ onBack }: WorkflowViewProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-theme-text-tertiary mb-6">
        <Button 
          onClick={onBack}
          className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary h-10 px-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <span>→</span>
        <span>Batch Management</span>
        <span>→</span>
        <span className="text-theme-text-secondary">Production Workflow</span>
      </div>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-theme-text-secondary mb-2">Production Workflow</h1>
        <p className="text-theme-text-tertiary">Drag and drop batches between production stages</p>
      </div>

      {/* Production Stages */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-8">
        {["Intake", "Sanding", "Finishing", "Sub-Assembly", "Final Assembly", "Acoustic QC", "Shipping"].map(
          (stage, index) => (
            <Card key={stage} className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader className="pb-3">
                <CardTitle className="text-theme-text-secondary text-sm text-center">{stage}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* Sample batches for demonstration */}
                {index === 0 &&
                  recentBatches.map((batch) => (
                    <div key={batch.id} className="bg-theme-bg-primary p-3 rounded border border-theme-border-secondary cursor-move">
                      <div className="text-theme-text-primary font-semibold text-sm">{batch.batchNumber}</div>
                      <div className="text-theme-text-tertiary text-xs">{batch.headphoneCount} units</div>
                      <div className="text-theme-text-secondary text-xs">{batch.model}</div>
                    </div>
                  ))}
                {index !== 0 && <div className="text-theme-text-tertiary text-xs text-center py-4">Drop batches here</div>}
              </CardContent>
            </Card>
          ),
        )}
      </div>

    </div>
  )
}