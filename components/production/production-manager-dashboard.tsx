"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Headphones,
  AlertTriangle,
  CheckCircle,
  Users,
  Clock,
  Bell,
  RefreshCw,
  StopCircle,
  TrendingUp,
  TrendingDown,
  Eye,
  MessageSquare,
  Settings,
  BarChart3,
  Package,
  Target,
  Activity,
  FileText,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Timer,
} from "lucide-react"
import TimingSettingsModal from "@/components/timing-settings-modal"
import Link from "next/link"

interface ProductionStage {
  id: string
  name: string
  icon: any
  activeOrders: number
  capacity: number
  averageTime: string
  bottleneck: boolean
  workers: Array<{
    name: string
    status: "working" | "available" | "break"
    currentOrder?: string
    timeElapsed?: string
  }>
  alerts: Array<{
    type: "warning" | "error" | "info"
    message: string
    orderId?: string
  }>
}

interface DashboardMetrics {
  activeOrders: {
    count: number
    status: "good" | "warning" | "critical"
    breakdown: { onTrack: number; delayed: number; critical: number }
  }
  dailyProgress: {
    completed: number
    target: number
    percentage: number
  }
  qualityStatus: {
    rate: number
    trend: "up" | "down" | "stable"
    change: number
  }
  workerStatus: {
    active: number
    total: number
    breakdown: { working: number; available: number; break: number; offline: number }
  }
}

// Simplified Stage Card Component
function StageCard({ stage, onViewDetails, onMessage }: { 
  stage: ProductionStage
  onViewDetails: (stage: ProductionStage) => void
  onMessage: (stage: ProductionStage) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const capacityPercentage = (stage.activeOrders / stage.capacity) * 100
  const hasAlerts = stage.alerts.length > 0
  const criticalAlerts = stage.alerts.filter(a => a.type === 'error').length

  return (
    <Card className={`bg-theme-bg-secondary border-theme-border-primary ${
      criticalAlerts > 0 ? 'border-red-500/50' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <stage.icon className="h-5 w-5 text-theme-text-secondary" />
            <CardTitle className="text-lg text-theme-text-secondary">{stage.name}</CardTitle>
            {stage.bottleneck && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Bottleneck
              </Badge>
            )}
          </div>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
        
        {/* Key Metrics Bar */}
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-theme-text-tertiary">Capacity</span>
            <span className={`font-medium ${
              capacityPercentage > 80 ? 'text-red-500' : 
              capacityPercentage > 60 ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {stage.activeOrders}/{stage.capacity}
            </span>
          </div>
          <Progress value={capacityPercentage} className="h-2" />
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-theme-text-tertiary">
                <Timer className="inline h-3 w-3 mr-1" />
                {stage.averageTime} avg
              </span>
              <span className="text-theme-text-tertiary">
                <Users className="inline h-3 w-3 mr-1" />
                {stage.workers.filter(w => w.status === 'working').length}/{stage.workers.length}
              </span>
            </div>
            {hasAlerts && (
              <Badge variant={criticalAlerts > 0 ? "destructive" : "secondary"} className="text-xs">
                {stage.alerts.length} {stage.alerts.length === 1 ? 'alert' : 'alerts'}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <Collapsible open={isExpanded}>
        <CollapsibleContent>
          <CardContent className="pt-0 space-y-3">
            {/* Workers Section */}
            <div>
              <h4 className="text-xs font-medium text-theme-text-secondary mb-2 uppercase">Workers</h4>
              <div className="grid grid-cols-2 gap-2">
                {stage.workers.map((worker, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm p-2 bg-theme-bg-primary rounded">
                    <div className={`w-2 h-2 rounded-full ${
                      worker.status === 'working' ? 'bg-green-500' :
                      worker.status === 'available' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-theme-text-tertiary truncate">{worker.name}</span>
                    {worker.timeElapsed && (
                      <span className="text-xs text-theme-text-tertiary ml-auto">{worker.timeElapsed}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts Section */}
            {hasAlerts && (
              <div>
                <h4 className="text-xs font-medium text-theme-text-secondary mb-2 uppercase">Active Alerts</h4>
                <div className="space-y-1">
                  {stage.alerts.map((alert, index) => (
                    <div
                      key={index}
                      className={`text-xs p-2 rounded flex items-start gap-2 ${
                        alert.type === "error"
                          ? "bg-red-500/10 text-red-500"
                          : alert.type === "warning"
                            ? "bg-yellow-500/10 text-yellow-500"
                            : "bg-blue-500/10 text-blue-500"
                      }`}
                    >
                      <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      <span>{alert.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onViewDetails(stage)}
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessage(stage)}
                className="flex-1"
              >
                <MessageSquare className="h-3 w-3 mr-1" />
                Message
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}

export default function ProductionManagerDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedStage, setSelectedStage] = useState<ProductionStage | null>(null)
  const [showStageDetails, setShowStageDetails] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data - in real implementation, this would come from API
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeOrders: {
      count: 24,
      status: "warning",
      breakdown: { onTrack: 18, delayed: 4, critical: 2 },
    },
    dailyProgress: {
      completed: 8,
      target: 12,
      percentage: 67,
    },
    qualityStatus: {
      rate: 96.2,
      trend: "up",
      change: 1.3,
    },
    workerStatus: {
      active: 12,
      total: 15,
      breakdown: { working: 9, available: 3, break: 2, offline: 1 },
    },
  })

  const [productionStages, setProductionStages] = useState<ProductionStage[]>([
    {
      id: "intake",
      name: "Intake",
      icon: Package,
      activeOrders: 4,
      capacity: 6,
      averageTime: "2.5h",
      bottleneck: false,
      workers: [
        { name: "Tony Martinez", status: "working", currentOrder: "ZMF-2024-0156", timeElapsed: "1h 23m" },
        { name: "Stephen Chen", status: "available" },
      ],
      alerts: [{ type: "info", message: "New batch ready for processing", orderId: "BATCH-042" }],
    },
    {
      id: "sanding",
      name: "Sanding",
      icon: Activity,
      activeOrders: 6,
      capacity: 8,
      averageTime: "4.2h",
      bottleneck: true,
      workers: [
        { name: "Jake Thompson", status: "working", currentOrder: "ZMF-2024-0157", timeElapsed: "2h 15m" },
        { name: "Mike Rodriguez", status: "working", currentOrder: "ZMF-2024-0158", timeElapsed: "3h 45m" },
        { name: "Sarah Kim", status: "break", timeElapsed: "15m" },
      ],
      alerts: [
        { type: "warning", message: "Capacity at 75% - consider reassignment", orderId: "ZMF-2024-0159" },
        { type: "error", message: "Quality issue detected", orderId: "ZMF-2024-0160" },
      ],
    },
    {
      id: "finishing",
      name: "Finishing",
      icon: BarChart3,
      activeOrders: 3,
      capacity: 4,
      averageTime: "6.1h",
      bottleneck: false,
      workers: [
        { name: "Kevin Chen", status: "working", currentOrder: "ZMF-2024-0161", timeElapsed: "4h 30m" },
        { name: "Lisa Park", status: "available" },
      ],
      alerts: [],
    },
    {
      id: "subassembly",
      name: "Sub-Assembly",
      icon: Settings,
      activeOrders: 5,
      capacity: 6,
      averageTime: "3.8h",
      bottleneck: false,
      workers: [
        { name: "David Wilson", status: "working", currentOrder: "ZMF-2024-0162", timeElapsed: "2h 10m" },
        { name: "Emma Davis", status: "working", currentOrder: "ZMF-2024-0163", timeElapsed: "1h 45m" },
      ],
      alerts: [{ type: "info", message: "Chassis batch completed", orderId: "CHASSIS-024" }],
    },
    {
      id: "final-assembly",
      name: "Final Assembly",
      icon: Headphones,
      activeOrders: 4,
      capacity: 5,
      averageTime: "5.5h",
      bottleneck: false,
      workers: [
        { name: "Matt Wilson", status: "working", currentOrder: "ZMF-2024-0164", timeElapsed: "3h 20m" },
        { name: "Alex Johnson", status: "available" },
      ],
      alerts: [{ type: "warning", message: "Driver alignment check needed", orderId: "ZMF-2024-0165" }],
    },
    {
      id: "acoustic-qc",
      name: "Acoustic QC",
      icon: Target,
      activeOrders: 2,
      capacity: 3,
      averageTime: "2.8h",
      bottleneck: false,
      workers: [{ name: "Rachel Green", status: "working", currentOrder: "ZMF-2024-0166", timeElapsed: "1h 15m" }],
      alerts: [],
    },
    {
      id: "shipping",
      name: "Shipping",
      icon: Package,
      activeOrders: 1,
      capacity: 4,
      averageTime: "1.5h",
      bottleneck: false,
      workers: [
        { name: "Laura Davis", status: "working", currentOrder: "ZMF-2024-0167", timeElapsed: "45m" },
        { name: "Tom Brown", status: "available" },
      ],
      alerts: [{ type: "info", message: "3 orders ready for shipment" }],
    },
  ])

  // Critical alerts calculation
  const criticalAlerts = productionStages.reduce((acc, stage) => 
    acc + stage.alerts.filter(a => a.type === 'error').length, 0
  )
  const warningAlerts = productionStages.reduce((acc, stage) => 
    acc + stage.alerts.filter(a => a.type === 'warning').length, 0
  )

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Simulate real-time data updates every 30 seconds
  useEffect(() => {
    const dataTimer = setInterval(() => {
      setLastUpdate(new Date())
    }, 30000)
    return () => clearInterval(dataTimer)
  }, [])

  const handleEmergencyStop = () => {
    setEmergencyMode(!emergencyMode)
  }

  const handleRefreshData = () => {
    setLastUpdate(new Date())
  }

  const handleViewStage = (stage: ProductionStage) => {
    setSelectedStage(stage)
    setShowStageDetails(true)
  }

  const handleMessageStage = (stage: ProductionStage) => {
    setSelectedStage(stage)
    setShowMessageModal(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Critical Alerts Banner */}
      {(criticalAlerts > 0 || emergencyMode) && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-6 py-3">
          {emergencyMode ? (
            <Alert className="border-0 bg-transparent p-0">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-500 font-medium">
                EMERGENCY MODE ACTIVE - All production has been halted. Click RESUME to continue operations.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="flex items-center gap-2 text-sm text-red-500">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{criticalAlerts} critical {criticalAlerts === 1 ? 'issue' : 'issues'} requiring immediate attention</span>
            </div>
          )}
        </div>
      )}

      {/* Simplified Header */}
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-text-secondary">Production Control Center</h1>
            <p className="text-sm text-theme-text-tertiary">
              Last updated: {lastUpdate.toLocaleTimeString()} • {currentTime.toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              className="border-theme-border-active"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>

            <div className="relative">
              <Button variant="outline" size="sm" className="border-theme-border-active">
                <Bell className="h-4 w-4" />
                {(criticalAlerts + warningAlerts) > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {criticalAlerts + warningAlerts}
                  </span>
                )}
              </Button>
            </div>

            <div className="flex gap-2">
              <Link href="/analytics">
                <Button size="sm" variant="ghost">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </Link>
              <Link href="/reports">
                <Button size="sm" variant="ghost">
                  <FileText className="h-4 w-4 mr-2" />
                  Reports
                </Button>
              </Link>
              <Button
                onClick={() => setShowSettingsModal(true)}
                size="sm"
                variant="ghost"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <Button
              onClick={handleEmergencyStop}
              size="sm"
              className={`${
                emergencyMode ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
              } text-white font-bold`}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              {emergencyMode ? "RESUME" : "EMERGENCY STOP"}
            </Button>
          </div>
        </div>
      </header>

      {/* Key Metrics Summary */}
      <div className="px-6 py-4 border-b border-theme-border-primary bg-theme-bg-secondary/30">
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-theme-bg-primary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-theme-text-tertiary uppercase">Active Orders</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-theme-text-primary">{metrics.activeOrders.count}</p>
                    <div className="flex gap-3 text-xs">
                      <span className="text-green-500">{metrics.activeOrders.breakdown.onTrack} ✓</span>
                      <span className="text-yellow-500">{metrics.activeOrders.breakdown.delayed} !</span>
                      <span className="text-red-500">{metrics.activeOrders.breakdown.critical} ✗</span>
                    </div>
                  </div>
                </div>
                <Package className="h-8 w-8 text-theme-text-tertiary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-theme-bg-primary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs text-theme-text-tertiary uppercase">Daily Progress</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-theme-text-primary">
                      {metrics.dailyProgress.completed}/{metrics.dailyProgress.target}
                    </p>
                    <Progress value={metrics.dailyProgress.percentage} className="flex-1 h-2" />
                  </div>
                </div>
                <Target className="h-8 w-8 text-theme-text-tertiary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-theme-bg-primary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-theme-text-tertiary uppercase">Quality Rate</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-theme-text-primary">{metrics.qualityStatus.rate}%</p>
                    {metrics.qualityStatus.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : metrics.qualityStatus.trend === "down" ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : null}
                  </div>
                </div>
                <CheckCircle className="h-8 w-8 text-theme-text-tertiary opacity-20" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-theme-bg-primary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-theme-text-tertiary uppercase">Workers Active</p>
                  <div className="flex items-center gap-3">
                    <p className="text-2xl font-bold text-theme-text-primary">
                      {metrics.workerStatus.active}/{metrics.workerStatus.total}
                    </p>
                    <div className="flex gap-1">
                      {Array.from({ length: metrics.workerStatus.breakdown.working }).map((_, i) => (
                        <div key={`w-${i}`} className="w-2 h-2 bg-green-500 rounded-full" />
                      ))}
                      {Array.from({ length: metrics.workerStatus.breakdown.available }).map((_, i) => (
                        <div key={`a-${i}`} className="w-2 h-2 bg-blue-500 rounded-full" />
                      ))}
                      {Array.from({ length: metrics.workerStatus.breakdown.break }).map((_, i) => (
                        <div key={`b-${i}`} className="w-2 h-2 bg-yellow-500 rounded-full" />
                      ))}
                    </div>
                  </div>
                </div>
                <Users className="h-8 w-8 text-theme-text-tertiary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-theme-bg-secondary">
            <TabsTrigger value="overview">Production Overview</TabsTrigger>
            <TabsTrigger value="alerts">
              Alerts
              {(criticalAlerts + warningAlerts) > 0 && (
                <Badge variant="destructive" className="ml-2 text-xs">
                  {criticalAlerts + warningAlerts}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="workers">Worker Management</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {productionStages.map((stage) => (
                <StageCard
                  key={stage.id}
                  stage={stage}
                  onViewDetails={handleViewStage}
                  onMessage={handleMessageStage}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <Card className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader>
                <CardTitle>Active Alerts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {productionStages.flatMap(stage => 
                  stage.alerts.map(alert => ({
                    ...alert,
                    stageName: stage.name,
                    stageId: stage.id
                  }))
                ).sort((a, b) => {
                  const priority = { error: 0, warning: 1, info: 2 }
                  return priority[a.type] - priority[b.type]
                }).map((alert, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg flex items-start gap-3 ${
                      alert.type === "error"
                        ? "bg-red-500/10 border border-red-500/30"
                        : alert.type === "warning"
                          ? "bg-yellow-500/10 border border-yellow-500/30"
                          : "bg-blue-500/10 border border-blue-500/30"
                    }`}
                  >
                    <AlertCircle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${
                      alert.type === "error" ? "text-red-500" :
                      alert.type === "warning" ? "text-yellow-500" : "text-blue-500"
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        alert.type === "error" ? "text-red-500" :
                        alert.type === "warning" ? "text-yellow-500" : "text-blue-500"
                      }`}>
                        {alert.stageName} - {alert.message}
                      </p>
                      {alert.orderId && (
                        <p className="text-xs text-theme-text-tertiary mt-1">Order: {alert.orderId}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workers" className="space-y-4">
            <Card className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader>
                <CardTitle>Worker Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {productionStages.flatMap(stage => 
                    stage.workers.map(worker => ({
                      ...worker,
                      stageName: stage.name
                    }))
                  ).sort((a, b) => {
                    const statusOrder = { working: 0, break: 1, available: 2 }
                    return statusOrder[a.status] - statusOrder[b.status]
                  }).map((worker, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-theme-bg-primary rounded-lg">
                      <div className={`w-3 h-3 rounded-full ${
                        worker.status === 'working' ? 'bg-green-500' :
                        worker.status === 'available' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-theme-text-secondary">{worker.name}</p>
                        <p className="text-xs text-theme-text-tertiary">{worker.stageName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-theme-text-tertiary capitalize">{worker.status}</p>
                        {worker.timeElapsed && (
                          <p className="text-xs text-theme-text-tertiary">{worker.timeElapsed}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Timing Settings Modal */}
      <TimingSettingsModal open={showSettingsModal} onOpenChange={setShowSettingsModal} />
      
      {/* Stage Details Modal */}
      <Dialog open={showStageDetails} onOpenChange={setShowStageDetails}>
        <DialogContent className="max-w-4xl bg-theme-bg-secondary border-theme-border-primary">
          <DialogHeader>
            <DialogTitle className="text-theme-text-secondary">
              {selectedStage?.name} Stage Details
            </DialogTitle>
          </DialogHeader>
          {selectedStage && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-theme-text-secondary mb-3">Current Status</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-theme-text-tertiary">Active Orders:</span>
                      <span className="text-theme-text-primary">{selectedStage.activeOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-text-tertiary">Capacity:</span>
                      <span className="text-theme-text-primary">{selectedStage.capacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-text-tertiary">Utilization:</span>
                      <span className="text-theme-text-primary">{Math.round((selectedStage.activeOrders / selectedStage.capacity) * 100)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-text-tertiary">Average Time:</span>
                      <span className="text-theme-text-primary">{selectedStage.averageTime}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-theme-text-secondary mb-3">Workers ({selectedStage.workers.length})</h3>
                  <div className="space-y-2">
                    {selectedStage.workers.map((worker, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-2 bg-theme-bg-primary rounded border border-theme-border-secondary">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            worker.status === 'working' ? 'bg-green-500' :
                            worker.status === 'available' ? 'bg-blue-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-theme-text-tertiary">{worker.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-theme-text-tertiary capitalize">{worker.status}</div>
                          {worker.currentOrder && <div className="text-xs text-theme-text-tertiary">{worker.currentOrder}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {selectedStage.alerts.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-theme-text-secondary mb-3">Active Alerts</h3>
                  <div className="space-y-2">
                    {selectedStage.alerts.map((alert, index) => (
                      <div
                        key={index}
                        className={`text-sm p-3 rounded border ${
                          alert.type === "error"
                            ? "border-red-500/30 bg-red-500/10 text-red-500"
                            : alert.type === "warning"
                              ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-500"
                              : "border-blue-500/30 bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {alert.message}
                        {alert.orderId && <span className="ml-2 opacity-75">({alert.orderId})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStageDetails(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message Stage Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-md bg-theme-bg-secondary border-theme-border-primary">
          <DialogHeader>
            <DialogTitle className="text-theme-text-secondary">
              Send Message to {selectedStage?.name} Team
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message" className="text-theme-text-tertiary">Message</Label>
              <Textarea
                id="message"
                placeholder="Enter your message to the production team..."
                className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary mt-1"
                rows={4}
              />
            </div>
            <div className="text-xs text-theme-text-tertiary">
              This message will be sent to all workers currently assigned to the {selectedStage?.name} stage.
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMessageModal(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
              onClick={() => {
                alert(`Message sent to ${selectedStage?.name} team!`)
                setShowMessageModal(false)
              }}
            >
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}