"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QualityOverviewCard } from "@/components/quality-overview-card"
import { IssuesByStageChart } from "@/components/issues-by-stage-chart"
import { WorkerQualityDashboard } from "@/components/worker-quality-dashboard"
import { IssuesByModelDashboard } from "@/components/issues-by-model-dashboard"
import { ShippingQualityDashboard } from "@/components/shipping-quality-dashboard"
import { ReportedIssuesDashboard } from "@/components/reported-issues-dashboard"
import {
  Headphones,
  ArrowLeft,
  Users,
  Package,
  Truck,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { useState } from "react"

interface QualityControlDashboardProps {
  onBack: () => void
}

const stageData = [
  {
    name: "Intake",
    passRate: 98,
    target: 97,
  },
  {
    name: "Sanding",
    passRate: 96,
    target: 95,
  },
  {
    name: "Finishing",
    passRate: 94,
    target: 96,
  },
  {
    name: "Sub-Assembly",
    passRate: 97,
    target: 96,
  },
  {
    name: "Final Assembly",
    passRate: 93,
    target: 95,
  },
  {
    name: "Acoustic QC",
    passRate: 91,
    target: 93,
  },
  {
    name: "Shipping",
    passRate: 99,
    target: 98,
  },
]

export default function QualityControlDashboard({ onBack }: QualityControlDashboardProps) {
  const [currentView, setCurrentView] = useState<
    "main" | "reported-issues" | "shipping-quality" | "worker-quality" | "issues-by-model"
  >("main")

  if (currentView === "reported-issues") {
    return <ReportedIssuesDashboard onBack={() => setCurrentView("main")} />
  }

  if (currentView === "shipping-quality") {
    return <ShippingQualityDashboard onBack={() => setCurrentView("main")} />
  }

  if (currentView === "worker-quality") {
    return <WorkerQualityDashboard onBack={() => setCurrentView("main")} />
  }

  if (currentView === "issues-by-model") {
    return <IssuesByModelDashboard onBack={() => setCurrentView("main")} />
  }

  const handleStageClick = (stage: string) => {
    // Store the selected stage and show detailed view
    localStorage.setItem('selected-quality-stage', stage)
    // In a real app, this would navigate to a detailed view
    // For now, we'll show an alert with the stage info
    const stageInfo = stageData.find(s => s.name === stage)
    if (stageInfo) {
      alert(`${stage} Stage Quality Details:\n\nPass Rate: ${stageInfo.passRate}%\nTarget: ${stageInfo.target}%\nStatus: ${stageInfo.passRate >= stageInfo.target ? 'Meeting Target' : 'Below Target'}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Header */}
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Headphones className="h-8 w-8 text-theme-text-secondary" />
              <div>
                <h1 className="text-2xl font-bold text-theme-text-secondary">Quality Control Dashboard</h1>
                <p className="text-sm text-theme-text-tertiary">Comprehensive QC Analytics & Monitoring</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentView("reported-issues")}
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Reported Issues
            </Button>
            <Button
              onClick={() => setCurrentView("shipping-quality")}
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
            >
              <Truck className="h-4 w-4 mr-2" />
              Shipping Quality
            </Button>
            <Button
              onClick={() => setCurrentView("worker-quality")}
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
            >
              <Users className="h-4 w-4 mr-2" />
              Worker Quality
            </Button>
            <Button
              onClick={() => setCurrentView("issues-by-model")}
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
            >
              <Package className="h-4 w-4 mr-2" />
              Issues by Model
            </Button>
          </div>
        </div>
      </header>

      {/* Overview Metrics */}
      <div className="px-6 py-6 border-b border-theme-border-primary">
        <h2 className="text-xl font-semibold text-theme-text-secondary mb-4">Quality Overview</h2>
        <div className="grid grid-cols-4 gap-4">
          <QualityOverviewCard
            title="First-Pass Quality Rate"
            value="94.2%"
            target={95}
            trend="up"
            trendValue="+0.8% this week"
            icon={CheckCircle}
            status="warning"
          />
          <QualityOverviewCard
            title="Total Rework Rate"
            value="5.8%"
            trend="down"
            trendValue="-0.3% this week"
            icon={XCircle}
            status="good"
          />
          <QualityOverviewCard
            title="Critical Issues"
            value="4"
            trend="up"
            trendValue="+2 since yesterday"
            icon={AlertTriangle}
            status="critical"
          />
          <QualityOverviewCard
            title="Quality Trend"
            value="Improving"
            trend="up"
            trendValue="+2.1% this month"
            icon={TrendingUp}
            status="good"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Issues by Stage Chart */}
          <div className="col-span-8">
            <IssuesByStageChart onStageClick={handleStageClick} />
          </div>

          {/* Right Column - Stage Pass Rates */}
          <div className="col-span-4">
            <Card className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary">Stage Pass Rates</CardTitle>
                <p className="text-sm text-theme-text-tertiary">Current quality performance by stage</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {stageData.map((stage) => {
                  const isAboveTarget = stage.passRate >= stage.target
                  return (
                    <div key={stage.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-theme-text-tertiary text-sm">{stage.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isAboveTarget ? "text-theme-status-success" : "text-theme-status-warning"}`}>
                            {stage.passRate}%
                          </span>
                          <span className="text-xs text-theme-text-tertiary">({stage.target}% target)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${isAboveTarget ? "bg-theme-status-success" : "bg-theme-status-warning"}`}
                          style={{ width: `${Math.min(stage.passRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
