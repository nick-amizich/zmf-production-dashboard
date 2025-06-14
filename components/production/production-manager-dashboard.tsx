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
  Minus,
  Eye,
  MessageSquare,
  Settings,
  BarChart3,
  Zap,
  Package,
  Target,
  Activity,
  FileText,
} from "lucide-react"
import TimingSettingsModal from "@/components/timing-settings-modal"
import Link from "next/link"
import { ProductionManagerAPI } from '@/lib/api/production-manager-api'
import { 
  type ManagerDashboardMetrics,
  type ProductionStageData
} from '@/lib/services/production-manager-service'
import { logger } from '@/lib/logger'
import { useMultiRealtime } from '@/hooks/use-realtime'

// Map stage IDs to icons
const stageIcons: Record<string, any> = {
  cups: Package,
  sanding: Activity,
  finishing: BarChart3,
  sub_assembly: Settings,
  final_assembly: Headphones,
  quality_control: CheckCircle,
  packaging: Package
}

export default function ProductionManagerDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [alertCount, setAlertCount] = useState(7)
  const [emergencyMode, setEmergencyMode] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [selectedStage, setSelectedStage] = useState<ProductionStageData | null>(null)
  const [showStageDetails, setShowStageDetails] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const [metrics, setMetrics] = useState<ManagerDashboardMetrics>({
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
    upcomingDeadlines: {
      tomorrow: 3,
      thisWeek: 8,
      urgency: "medium",
    },
  })

  const [productionStages, setProductionStages] = useState<ProductionStageData[]>([
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

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      logger.debug("Loading manager dashboard data")
      
      const [metricsData, stagesData] = await Promise.all([
        ProductionManagerAPI.getDashboardMetrics(),
        ProductionManagerAPI.getProductionStages()
      ])

      // Add icons to stages
      const stagesWithIcons = stagesData.map(stage => ({
        ...stage,
        icon: stageIcons[stage.id] || Package
      }))

      setMetrics(metricsData)
      setProductionStages(stagesWithIcons)
      setLastUpdate(new Date())
      setIsLoading(false)
      
      // Update alert count based on stage alerts
      const totalAlerts = stagesData.reduce((count, stage) => 
        count + stage.alerts.length, 0
      )
      setAlertCount(totalAlerts)
    } catch (error) {
      logger.error('Failed to load manager dashboard data', error)
      setIsLoading(false)
    }
  }

  // Subscribe to real-time updates
  useMultiRealtime({
    subscriptions: [
      { table: 'batches' },
      { table: 'orders' },
      { table: 'stage_assignments' },
      { table: 'employees' },
      { table: 'issues' },
      { table: 'production_metrics' },
      { table: 'system_logs', filter: 'level=in.(error,warn)' }
    ],
    onChange: (table, payload) => {
      logger.debug(`Manager dashboard real-time update from ${table}`, payload)
      
      // For critical updates, refresh immediately
      switch (table) {
        case 'batches':
        case 'orders':
        case 'production_metrics':
          // Reload metrics when production data changes
          ProductionManagerAPI.getDashboardMetrics()
            .then(setMetrics)
            .catch(error => logger.error('Failed to reload manager metrics', error))
          break
          
        case 'stage_assignments':
        case 'employees':
        case 'issues':
          // Reload stages data when assignments, workers, or issues change
          ProductionManagerAPI.getProductionStages()
            .then(stagesData => {
              const stagesWithIcons = stagesData.map(stage => ({
                ...stage,
                icon: stageIcons[stage.id] || Package
              }))
              setProductionStages(stagesWithIcons)
              
              // Update alert count
              const totalAlerts = stagesData.reduce((count, stage) => 
                count + stage.alerts.length, 0
              )
              setAlertCount(totalAlerts)
            })
            .catch(error => logger.error('Failed to reload stages', error))
          break
          
        case 'system_logs':
          // Increment alert count for new errors/warnings
          if (payload.eventType === 'INSERT') {
            setAlertCount(prev => prev + 1)
          }
          break
      }
      
      // Update last update time
      setLastUpdate(new Date())
    }
  })

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleEmergencyStop = () => {
    setEmergencyMode(!emergencyMode)
    // In real implementation, this would trigger emergency protocols
  }

  const handleRefreshData = async () => {
    await loadDashboardData()
  }

  const handleViewStage = (stage: ProductionStageData) => {
    setSelectedStage(stage)
    setShowStageDetails(true)
  }

  const handleMessageStage = (stage: ProductionStageData) => {
    setSelectedStage(stage)
    setShowMessageModal(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-theme-status-success"
      case "warning":
        return "text-theme-status-warning"
      case "critical":
        return "text-theme-status-error"
      default:
        return "text-theme-text-tertiary"
    }
  }

  const getWorkerStatusColor = (status: string) => {
    switch (status) {
      case "working":
        return "bg-theme-status-success"
      case "available":
        return "bg-theme-status-info"
      case "break":
        return "bg-theme-status-warning"
      default:
        return "bg-gray-600"
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary flex items-center justify-center">
        <div className="text-theme-text-secondary text-xl">Loading Manager Dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Header Section */}
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Headphones className="h-8 w-8 text-theme-text-secondary" />
            <div>
              <h1 className="text-2xl font-bold text-theme-text-secondary">Production Manager Dashboard</h1>
              <p className="text-sm text-theme-text-tertiary">
                {currentTime.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {" • "}
                {currentTime.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="text-theme-text-secondary font-medium">Manager: John Smith</div>
              <div className="text-theme-text-tertiary">Last update: {lastUpdate.toLocaleTimeString()}</div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshData}
              className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>

            <Button variant="outline" size="sm" className="border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20">
              <Bell className="h-4 w-4 mr-2" />
              {alertCount}
            </Button>

            <Link href="/analytics">
              <Button className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary font-medium">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </Link>

            <Link href="/reports">
              <Button className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary font-medium">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </Button>
            </Link>

            <Button
              onClick={() => setShowSettingsModal(true)}
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary font-medium"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>

            <Button
              onClick={handleEmergencyStop}
              className={`${
                emergencyMode ? "bg-theme-status-error hover:bg-red-700" : "bg-theme-status-error hover:bg-theme-status-error"
              } text-theme-text-primary font-bold`}
            >
              <StopCircle className="h-4 w-4 mr-2" />
              {emergencyMode ? "RESUME" : "EMERGENCY STOP"}
            </Button>
          </div>
        </div>
      </header>

      {/* Emergency Mode Alert */}
      {emergencyMode && (
        <Alert className="mx-6 mt-4 border-theme-status-error bg-theme-status-error/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-theme-status-error font-medium">
            EMERGENCY MODE ACTIVE - All production has been halted. Click RESUME to continue operations.
          </AlertDescription>
        </Alert>
      )}

      {/* Top Metrics Bar */}
      <div className="px-6 py-4 border-b border-theme-border-primary">
        <div className="grid grid-cols-5 gap-4">
          {/* Active Orders */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-text-tertiary">Active Orders</p>
                  <p className={`text-2xl font-bold ${getStatusColor(metrics.activeOrders.status)}`}>
                    {metrics.activeOrders.count}
                  </p>
                  <div className="flex gap-2 text-xs mt-1">
                    <span className="text-theme-status-success">{metrics.activeOrders.breakdown.onTrack} on track</span>
                    <span className="text-theme-status-warning">{metrics.activeOrders.breakdown.delayed} delayed</span>
                    <span className="text-theme-status-error">{metrics.activeOrders.breakdown.critical} critical</span>
                  </div>
                </div>
                <Package className="h-8 w-8 text-theme-brand-secondary" />
              </div>
            </CardContent>
          </Card>

          {/* Daily Progress */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-theme-text-tertiary">Daily Progress</p>
                  <p className="text-2xl font-bold text-theme-text-primary">
                    {metrics.dailyProgress.completed}/{metrics.dailyProgress.target}
                  </p>
                  <Progress value={metrics.dailyProgress.percentage} className="mt-2 h-2" />
                  <p className="text-xs text-theme-text-tertiary mt-1">{metrics.dailyProgress.percentage}% complete</p>
                </div>
                <Target className="h-8 w-8 text-theme-brand-secondary" />
              </div>
            </CardContent>
          </Card>

          {/* Quality Status */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-text-tertiary">Quality Rate</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-theme-text-primary">{metrics.qualityStatus.rate}%</p>
                    {metrics.qualityStatus.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-theme-status-success" />
                    ) : metrics.qualityStatus.trend === "down" ? (
                      <TrendingDown className="h-4 w-4 text-theme-status-error" />
                    ) : (
                      <Minus className="h-4 w-4 text-theme-text-tertiary" />
                    )}
                  </div>
                  <p className="text-xs text-theme-text-tertiary">
                    {metrics.qualityStatus.trend === "up" ? "+" : ""}
                    {metrics.qualityStatus.change}% vs yesterday
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-theme-brand-secondary" />
              </div>
            </CardContent>
          </Card>

          {/* Worker Status */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-text-tertiary">Workers Active</p>
                  <p className="text-2xl font-bold text-theme-text-primary">
                    {metrics.workerStatus.active}/{metrics.workerStatus.total}
                  </p>
                  <div className="flex gap-1 mt-2">
                    <div className="w-2 h-2 bg-theme-status-success rounded-full" title="Working" />
                    <div className="w-2 h-2 bg-theme-status-info rounded-full" title="Available" />
                    <div className="w-2 h-2 bg-theme-status-warning rounded-full" title="Break" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full" title="Offline" />
                  </div>
                </div>
                <Users className="h-8 w-8 text-theme-brand-secondary" />
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="bg-theme-bg-secondary border-theme-border-primary">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-theme-text-tertiary">Due Tomorrow</p>
                  <p
                    className={`text-2xl font-bold ${
                      metrics.upcomingDeadlines.urgency === "high"
                        ? "text-theme-status-error"
                        : metrics.upcomingDeadlines.urgency === "medium"
                          ? "text-theme-status-warning"
                          : "text-theme-status-success"
                    }`}
                  >
                    {metrics.upcomingDeadlines.tomorrow}
                  </p>
                  <p className="text-xs text-theme-text-tertiary">{metrics.upcomingDeadlines.thisWeek} this week</p>
                </div>
                <Clock className="h-8 w-8 text-theme-brand-secondary" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {productionStages.map((stage) => (
            <Card key={stage.id} className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <stage.icon className="h-6 w-6 text-theme-text-secondary" />
                    <CardTitle className="text-theme-text-secondary">{stage.name}</CardTitle>
                    {stage.bottleneck && <Zap className="h-4 w-4 text-theme-status-warning" title="Bottleneck" />}
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      stage.activeOrders / stage.capacity > 0.8
                        ? "border-theme-status-error text-theme-status-error"
                        : stage.activeOrders / stage.capacity > 0.6
                          ? "border-theme-status-warning text-theme-status-warning"
                          : "border-theme-status-success text-theme-status-success"
                    }`}
                  >
                    {stage.activeOrders}/{stage.capacity}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-theme-text-tertiary">
                  <span>Avg: {stage.averageTime}</span>
                  <span>{Math.round((stage.activeOrders / stage.capacity) * 100)}% capacity</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Workers */}
                <div>
                  <h4 className="text-sm font-medium text-theme-text-secondary mb-2">Workers ({stage.workers.length})</h4>
                  <div className="space-y-2">
                    {stage.workers.map((worker, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getWorkerStatusColor(worker.status)}`} />
                          <span className="text-theme-text-tertiary">{worker.name}</span>
                        </div>
                        <div className="text-right">
                          {worker.currentOrder && <div className="text-xs text-theme-text-tertiary">{worker.currentOrder}</div>}
                          {worker.timeElapsed && <div className="text-xs text-theme-text-tertiary">{worker.timeElapsed}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alerts */}
                {stage.alerts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-theme-text-secondary mb-2">Alerts ({stage.alerts.length})</h4>
                    <div className="space-y-1">
                      {stage.alerts.map((alert, index) => (
                        <div
                          key={index}
                          className={`text-xs p-2 rounded border ${
                            alert.type === "error"
                              ? "border-theme-status-error/30 bg-theme-status-error/10 text-theme-status-error"
                              : alert.type === "warning"
                                ? "border-theme-status-warning/30 bg-theme-status-warning/10 text-theme-status-warning"
                                : "border-theme-status-info/30 bg-theme-status-info/10 text-theme-status-info"
                          }`}
                        >
                          {alert.message}
                          {alert.orderId && <span className="ml-2 opacity-75">({alert.orderId})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewStage(stage)}
                    className="flex-1 border-theme-border-primary text-theme-text-secondary hover:bg-theme-brand-secondary/20"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMessageStage(stage)}
                    className="flex-1 border-theme-border-primary text-theme-text-secondary hover:bg-theme-brand-secondary/20"
                  >
                    <MessageSquare className="h-3 w-3 mr-1" />
                    Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                          <div className={`w-2 h-2 rounded-full ${getWorkerStatusColor(worker.status)}`} />
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
                            ? "border-theme-status-error/30 bg-theme-status-error/10 text-theme-status-error"
                            : alert.type === "warning"
                              ? "border-theme-status-warning/30 bg-theme-status-warning/10 text-theme-status-warning"
                              : "border-theme-status-info/30 bg-theme-status-info/10 text-theme-status-info"
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
                // In real implementation, this would send the message
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
