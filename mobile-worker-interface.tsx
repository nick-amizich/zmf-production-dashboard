"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StationButton } from "./components/station-button"
import { TimerControls } from "./components/timer-controls"
import { QualityChecklist } from "./components/quality-checklist"
import { TaskSummary } from "./components/task-summary"
import {
  Headphones,
  ArrowLeft,
  Package,
  Wrench,
  Palette,
  Cog,
  Settings,
  Volume2,
  Truck,
  User,
  MessageSquare,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

type Screen = "station-select" | "current-task" | "quality-check" | "task-summary"

const stations = [
  { id: "intake", title: "Intake", stage: "Cup Verification", icon: Package, activeOrders: 2, activeBatches: 1 },
  { id: "sanding", title: "Sanding", stage: "Surface Preparation", icon: Wrench, activeOrders: 3, activeBatches: 0 },
  {
    id: "finishing",
    title: "Finishing",
    stage: "Staining & Coating",
    icon: Palette,
    activeOrders: 1,
    activeBatches: 1,
  },
  {
    id: "sub-assembly",
    title: "Sub-Assembly",
    stage: "Chassis & Baffle",
    icon: Cog,
    activeOrders: 2,
    activeBatches: 0,
  },
  {
    id: "final-assembly",
    title: "Final Assembly",
    stage: "Complete Build",
    icon: Settings,
    activeOrders: 1,
    activeBatches: 0,
  },
  { id: "acoustic-qc", title: "Acoustic QC", stage: "Sound Testing", icon: Volume2, activeOrders: 2, activeBatches: 0 },
  { id: "shipping", title: "Shipping", stage: "Packaging", icon: Truck, activeOrders: 1, activeBatches: 0 },
]

const sampleOrder = {
  orderNumber: "ZMF-2024-0157",
  customerName: "Sarah Johnson",
  model: "Verite Closed",
  woodType: "Sapele",
  stage: "Finishing",
  progress: 60,
  estimatedTime: "2:00",
  batchNumber: "SPEC-2024-042",
  batchNotes:
    "Use cup set from shelf B-3. Pay special attention to grain direction - customer requested matched grain pattern. Apply stain in thin, even coats.",
  referenceImages: ["/placeholder.svg?height=100&width=100", "/placeholder.svg?height=100&width=100"],
  headphoneNumber: 2,
  totalInBatch: 4,
  shopifyOrderId: "gid://shopify/Order/abc123",
  priority: "standard" as const,
}

const finishingChecklist = [
  {
    id: "1",
    description: "Stain coverage is even across entire surface",
    requiresPhoto: true,
    status: "pending" as const,
    photoTaken: false,
  },
  {
    id: "2",
    description: "No drips or runs in finish",
    requiresPhoto: true,
    status: "pending" as const,
    photoTaken: false,
  },
  {
    id: "3",
    description: "Color matches specification",
    requiresPhoto: false,
    status: "pending" as const,
    photoTaken: false,
  },
  {
    id: "4",
    description: "Surface is smooth to touch",
    requiresPhoto: false,
    status: "pending" as const,
    photoTaken: false,
  },
  {
    id: "5",
    description: "No contamination or debris",
    requiresPhoto: true,
    status: "pending" as const,
    photoTaken: false,
  },
]

export default function MobileWorkerInterface() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("station-select")
  const [selectedStation, setSelectedStation] = useState<string | null>(null)
  const [checklistItems, setChecklistItems] = useState(finishingChecklist)
  const [workerName] = useState("Kevin Chen")

  const handleStationSelect = (stationId: string) => {
    setSelectedStation(stationId)
    setCurrentScreen("current-task")
  }

  const handleStartQualityCheck = () => {
    setCurrentScreen("quality-check")
  }

  const handleItemUpdate = (id: string, status: "pass" | "fail", notes?: string) => {
    setChecklistItems((items) => items.map((item) => (item.id === id ? { ...item, status, notes } : item)))
  }

  const handlePhotoCapture = (itemId: string) => {
    setChecklistItems((items) => items.map((item) => (item.id === itemId ? { ...item, photoTaken: true } : item)))
  }

  const handleQualityComplete = () => {
    setCurrentScreen("task-summary")
  }

  const completedChecks = checklistItems.filter((item) => item.status !== "pending").length
  const passedChecks = checklistItems.filter((item) => item.status === "pass").length
  const failedChecks = checklistItems.filter((item) => item.status === "fail").length
  const photosCaptured = checklistItems.filter((item) => item.photoTaken).length

  const renderHeader = () => (
    <header className="bg-[#1a0d08] border-b border-[#8B4513]/30 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {currentScreen !== "station-select" && (
            <Button
              onClick={() => setCurrentScreen("station-select")}
              className="bg-[#8B4513] hover:bg-[#8B4513]/80 h-12 w-12 p-0"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <Headphones className="h-8 w-8 text-[#d4a574]" />
            <div>
              <h1 className="text-xl font-bold text-[#d4a574]">ZMF Production</h1>
              <p className="text-sm text-gray-400">Shop Floor Interface</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-[#d4a574]" />
          <span className="text-[#d4a574] font-medium">{workerName}</span>
        </div>
      </div>
    </header>
  )

  const renderStationSelect = () => (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#d4a574] mb-2">Select Your Station</h2>
        <p className="text-gray-400">Choose the production stage you're working on</p>
      </div>

      <div className="space-y-4">
        {stations.map((station) => (
          <StationButton
            key={station.id}
            icon={station.icon}
            title={station.title}
            stage={station.stage}
            activeOrders={station.activeOrders}
            activeBatches={station.activeBatches}
            onClick={() => handleStationSelect(station.id)}
          />
        ))}
      </div>
    </div>
  )

  const renderCurrentTask = () => (
    <div className="p-6 space-y-6">
      <Card className="bg-[#1a0d08] border-[#8B4513]/30">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-32 h-32 mx-auto bg-[#8B4513]/20 rounded-lg flex items-center justify-center">
              <Headphones className="h-16 w-16 text-[#d4a574]" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-[#d4a574]">{sampleOrder.model}</h2>
              <p className="text-lg text-gray-300">{sampleOrder.woodType} Wood</p>
              <div className="space-y-1 text-sm text-gray-400">
                <p>Order: {sampleOrder.orderNumber}</p>
                <p>Customer: {sampleOrder.customerName}</p>
                <p>
                  Batch: {sampleOrder.batchNumber} ({sampleOrder.headphoneNumber}/{sampleOrder.totalInBatch})
                </p>
                <div className="flex items-center gap-2">
                  <span>Priority:</span>
                  <Badge className={sampleOrder.priority === "rush" ? "bg-red-600" : "bg-blue-600"}>
                    {sampleOrder.priority.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a0d08] border-[#8B4513]/30">
        <CardHeader>
          <CardTitle className="text-[#d4a574]">Stage Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-300">Current Stage: {sampleOrder.stage}</span>
            <span className="text-[#d4a574]">{sampleOrder.progress}% Complete</span>
          </div>
          <Progress value={sampleOrder.progress} className="h-3 bg-[#8B4513]/20" />
        </CardContent>
      </Card>

      {/* Batch Instructions */}
      {sampleOrder.batchNotes && (
        <Card className="bg-[#1a0d08] border-[#8B4513]/30">
          <CardHeader>
            <CardTitle className="text-[#d4a574] flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Batch Instructions ({sampleOrder.batchNumber})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-white text-sm">{sampleOrder.batchNotes}</div>
            {sampleOrder.referenceImages && sampleOrder.referenceImages.length > 0 && (
              <div>
                <h4 className="text-[#d4a574] text-sm font-medium mb-2">Reference Images:</h4>
                <div className="grid grid-cols-2 gap-2">
                  {sampleOrder.referenceImages.map((imageUrl, index) => (
                    <img
                      key={index}
                      src={imageUrl || "/placeholder.svg"}
                      alt={`Reference ${index + 1}`}
                      className="w-full h-20 object-cover rounded border border-[#8B4513]/30 cursor-pointer"
                      onClick={() => {
                        // In real implementation, open full-size image modal
                        window.open(imageUrl, "_blank")
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <TimerControls
        estimatedTime={sampleOrder.estimatedTime}
        onStart={() => console.log("Timer started")}
        onPause={() => console.log("Timer paused")}
        onComplete={handleStartQualityCheck}
      />

      <Button
        onClick={handleStartQualityCheck}
        className="w-full h-16 bg-[#8B4513] hover:bg-[#8B4513]/80 text-white text-lg"
      >
        Start Quality Checklist
      </Button>
    </div>
  )

  const renderQualityCheck = () => (
    <div className="p-6">
      <QualityChecklist
        stage={sampleOrder.stage}
        items={checklistItems}
        onItemUpdate={handleItemUpdate}
        onPhotoCapture={handlePhotoCapture}
        onReportIssue={() => console.log("Issue reported")}
        onComplete={handleQualityComplete}
      />
    </div>
  )

  const renderTaskSummary = () => (
    <div className="p-6">
      <TaskSummary
        order={sampleOrder}
        completedChecks={completedChecks}
        totalChecks={checklistItems.length}
        passedChecks={passedChecks}
        failedChecks={failedChecks}
        photosCaptured={photosCaptured}
        timeElapsed="1:45"
        workerName={workerName}
        onConfirm={() => {
          console.log("Task confirmed")
          setCurrentScreen("station-select")
          // Reset checklist for next task
          setChecklistItems(finishingChecklist)
        }}
        onBack={() => setCurrentScreen("quality-check")}
      />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a0d08] text-white">
      {renderHeader()}

      <main className="pb-6">
        {currentScreen === "station-select" && renderStationSelect()}
        {currentScreen === "current-task" && renderCurrentTask()}
        {currentScreen === "quality-check" && renderQualityCheck()}
        {currentScreen === "task-summary" && renderTaskSummary()}
      </main>
    </div>
  )
}
