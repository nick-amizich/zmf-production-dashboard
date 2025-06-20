"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Home, Users, Clock, Play, Pause, Camera, CheckCircle, XCircle } from "lucide-react"

interface WorkerInterfaceProps {
  onBack: () => void
}

type WorkerView = "stage-selection" | "work-station" | "active-work"

const stages = [
  { id: 1, name: "INTAKE", description: "Cup verification & wood matching", workers: 1, waitTime: "0 min" },
  { id: 2, name: "SANDING", description: "Surface preparation & shape accuracy", workers: 2, waitTime: "15 min" },
  { id: 3, name: "FINISHING", description: "Staining, coating & drying", workers: 1, waitTime: "30 min" },
  { id: 4, name: "SUB-ASSEMBLY", description: "Chassis & baffle assembly", workers: 1, waitTime: "0 min" },
  { id: 5, name: "FINAL ASSEMBLY", description: "Complete headphone build", workers: 2, waitTime: "45 min" },
  { id: 6, name: "ACOUSTIC QC", description: "Sound testing & measurement", workers: 1, waitTime: "0 min" },
  { id: 7, name: "SHIPPING", description: "Packaging & coordination", workers: 1, waitTime: "0 min" },
]

const availableBatches = [
  {
    id: "BATCH-001",
    headphoneCount: 4,
    model: "Verite Closed",
    woodType: "Sapele",
    estimatedTime: "2:00",
    priority: "normal" as const,
  },
  {
    id: "BATCH-002",
    headphoneCount: 2,
    model: "Caldera Open",
    woodType: "Cocobolo",
    estimatedTime: "2:30",
    priority: "high" as const,
  },
  {
    id: "BATCH-003",
    headphoneCount: 6,
    model: "Auteur",
    woodType: "Cherry",
    estimatedTime: "3:00",
    priority: "normal" as const,
  },
]

const qualityChecklist = [
  { id: 1, description: "Wood grain matches specification", requiresPhoto: true, completed: false },
  { id: 2, description: "Surface is smooth and even", requiresPhoto: true, completed: false },
  { id: 3, description: "No visible defects or damage", requiresPhoto: false, completed: false },
  { id: 4, description: "Dimensions within tolerance", requiresPhoto: false, completed: false },
]

export default function WorkerInterface({ onBack }: WorkerInterfaceProps) {
  const [currentView, setCurrentView] = useState<WorkerView>("stage-selection")
  const [selectedStage, setSelectedStage] = useState<number | null>(null)
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)
  const [isWorking, setIsWorking] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [checklist, setChecklist] = useState(qualityChecklist)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleStageSelect = (stageId: number) => {
    setSelectedStage(stageId)
    setCurrentView("work-station")
  }

  const handleBatchSelect = (batchId: string) => {
    setSelectedBatch(batchId)
    setCurrentView("active-work")
  }

  const handleStartWork = () => {
    setIsWorking(true)
    // In real app, start timer interval
  }

  const handleCompleteCheck = (checkId: number, passed: boolean) => {
    setChecklist((prev) => prev.map((item) => (item.id === checkId ? { ...item, completed: true, passed } : item)))
  }

  const renderBreadcrumb = () => {
    const paths = []
    paths.push("Worker Interface")

    if (currentView === "work-station" && selectedStage) {
      const stage = stages.find((s) => s.id === selectedStage)
      paths.push(`Stage ${selectedStage}: ${stage?.name}`)
    }

    if (currentView === "active-work" && selectedBatch) {
      paths.push("Active Work")
    }

    return (
      <div className="flex items-center gap-2 text-sm text-theme-text-tertiary mb-4">
        <Button onClick={onBack} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary h-10 px-4">
          <Home className="h-4 w-4 mr-2" />
          Home
        </Button>
        <span>→</span>
        {paths.map((path, index) => (
          <span key={index} className={index === paths.length - 1 ? "text-theme-text-secondary" : ""}>
            {path}
            {index < paths.length - 1 && <span className="mx-2">→</span>}
          </span>
        ))}
      </div>
    )
  }

  if (currentView === "stage-selection") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
        {renderBreadcrumb()}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-theme-text-secondary mb-2">SELECT YOUR STAGE</h1>
          <p className="text-xl text-theme-text-tertiary">Choose the production stage you&apos;re working on</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {stages.map((stage) => (
            <Card
              key={stage.id}
              className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-pointer"
              onClick={() => handleStageSelect(stage.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-theme-text-secondary mb-2">
                      {stage.id}. {stage.name}
                    </h3>
                    <p className="text-theme-text-tertiary text-lg">{stage.description}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-theme-text-tertiary" />
                      <span className="text-theme-text-primary">{stage.workers} working</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-theme-text-tertiary" />
                      <span className="text-theme-text-primary">{stage.waitTime} wait</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (currentView === "work-station") {
    const stage = stages.find((s) => s.id === selectedStage)

    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
        {renderBreadcrumb()}

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-theme-text-secondary mb-2">
            STAGE {selectedStage}: {stage?.name}
          </h1>
          <p className="text-xl text-theme-text-tertiary">Select your work batch</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {availableBatches.map((batch) => (
            <Card key={batch.id} className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-theme-text-secondary">{batch.id}</h3>
                    <p className="text-theme-text-tertiary">{batch.headphoneCount} headphones</p>
                  </div>
                  {batch.priority === "high" && <Badge className="bg-theme-status-warning text-theme-text-primary">HIGH PRIORITY</Badge>}
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div>
                    <div className="text-lg font-semibold text-theme-text-primary">{batch.model}</div>
                    <div className="text-sm text-theme-text-tertiary">Model</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-theme-text-primary">{batch.woodType}</div>
                    <div className="text-sm text-theme-text-tertiary">Wood Type</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-theme-text-primary">{batch.estimatedTime}</div>
                    <div className="text-sm text-theme-text-tertiary">Est. Time</div>
                  </div>
                </div>

                <Button
                  onClick={() => handleBatchSelect(batch.id)}
                  className="w-full h-16 bg-theme-status-success hover:bg-green-700 text-theme-text-primary text-xl font-semibold"
                >
                  START WORK
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button
            onClick={() => setCurrentView("stage-selection")}
            className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary h-12 px-8"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Stage Selection
          </Button>
        </div>
      </div>
    )
  }

  if (currentView === "active-work") {
    const batch = availableBatches.find((b) => b.id === selectedBatch)
    const currentCheck = checklist.find((c) => !c.completed)

    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary p-6">
        {renderBreadcrumb()}

        {/* Timer Display */}
        <div className="text-center mb-8">
          <div className="text-6xl font-bold text-theme-text-secondary mb-2">
            {formatTime(elapsedTime)} / {batch?.estimatedTime}
          </div>
          <div className="flex items-center justify-center gap-4">
            {!isWorking ? (
              <Button onClick={handleStartWork} className="bg-theme-status-success hover:bg-green-700 text-theme-text-primary h-12 px-8">
                <Play className="h-5 w-5 mr-2" />
                START TIMER
              </Button>
            ) : (
              <Button
                onClick={() => setIsWorking(false)}
                className="bg-theme-status-warning hover:bg-amber-700 text-theme-text-primary h-12 px-8"
              >
                <Pause className="h-5 w-5 mr-2" />
                PAUSE WORK
              </Button>
            )}
          </div>
        </div>

        {/* Current Task */}
        <Card className="bg-theme-bg-secondary border-theme-border-primary mb-8 max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold text-theme-text-secondary mb-4">{batch?.id}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-lg font-semibold text-theme-text-primary">{batch?.model}</div>
                <div className="text-sm text-theme-text-tertiary">Model</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-theme-text-primary">{batch?.woodType}</div>
                <div className="text-sm text-theme-text-tertiary">Wood</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-theme-text-primary">{batch?.headphoneCount}</div>
                <div className="text-sm text-theme-text-tertiary">Units</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Quality Check */}
        {currentCheck && (
          <Card className="bg-theme-bg-secondary border-theme-border-primary mb-8 max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold text-theme-text-secondary mb-4">QUALITY CHECK</h3>
              <p className="text-lg text-theme-text-primary mb-6">{currentCheck.description}</p>

              {currentCheck.requiresPhoto && (
                <Button className="w-full h-16 bg-theme-status-info hover:bg-blue-700 text-theme-text-primary text-lg mb-6">
                  <Camera className="h-6 w-6 mr-2" />
                  TAKE PHOTO
                </Button>
              )}

              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => handleCompleteCheck(currentCheck.id, true)}
                  className="h-16 bg-theme-status-success hover:bg-green-700 text-theme-text-primary text-lg"
                >
                  <CheckCircle className="h-6 w-6 mr-2" />
                  PASS
                </Button>
                <Button
                  onClick={() => handleCompleteCheck(currentCheck.id, false)}
                  className="h-16 bg-theme-status-error hover:bg-red-700 text-theme-text-primary text-lg"
                >
                  <XCircle className="h-6 w-6 mr-2" />
                  NEEDS REWORK
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Progress */}
        <div className="text-center">
          <div className="text-lg text-theme-text-tertiary mb-2">
            Progress: {checklist.filter((c) => c.completed).length} / {checklist.length} checks
          </div>

          {checklist.every((c) => c.completed) && (
            <Button className="h-16 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary text-xl px-12">COMPLETE STAGE</Button>
          )}
        </div>
      </div>
    )
  }

  return null
}
