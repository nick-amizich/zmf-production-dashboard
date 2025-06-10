"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { QualityOverviewCard } from "./components/quality-overview-card"
import { IssuesByStageChart } from "./components/issues-by-stage-chart"
import { WorkerQualityDashboard } from "./components/worker-quality-dashboard"
import { IssuesByModelDashboard } from "./components/issues-by-model-dashboard"
import { ShippingQualityDashboard } from "./components/shipping-quality-dashboard"
import { ReportedIssuesDashboard } from "./components/reported-issues-dashboard"
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
    console.log(`Viewing issues for stage: ${stage}`)
    // Here you would typically navigate to a detailed stage issues view
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
      {/* Header */}
      <header className="border-b border-[#8B4513]/30 bg-[#1a0d08]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Headphones className="h-8 w-8 text-[#d4a574]" />
              <div>
                <h1 className="text-2xl font-bold text-[#d4a574]">Quality Control Dashboard</h1>
                <p className="text-sm text-gray-400">Comprehensive QC Analytics & Monitoring</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setCurrentView("reported-issues")}
              className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Reported Issues
            </Button>
            <Button
              onClick={() => setCurrentView("shipping-quality")}
              className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white"
            >
              <Truck className="h-4 w-4 mr-2" />
              Shipping Quality
            </Button>
            <Button
              onClick={() => setCurrentView("worker-quality")}
              className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white"
            >
              <Users className="h-4 w-4 mr-2" />
              Worker Quality
            </Button>
            <Button
              onClick={() => setCurrentView("issues-by-model")}
              className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white"
            >
              <Package className="h-4 w-4 mr-2" />
              Issues by Model
            </Button>
          </div>
        </div>
      </header>

      {/* Overview Metrics */}
      <div className="px-6 py-6 border-b border-[#8B4513]/30">
        <h2 className="text-xl font-semibold text-[#d4a574] mb-4">Quality Overview</h2>
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
            <Card className="bg-[#1a0d08] border-[#8B4513]/30">
              <CardHeader>
                <CardTitle className="text-[#d4a574]">Stage Pass Rates</CardTitle>
                <p className="text-sm text-gray-400">Current quality performance by stage</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {stageData.map((stage) => {
                  const isAboveTarget = stage.passRate >= stage.target
                  return (
                    <div key={stage.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">{stage.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isAboveTarget ? "text-green-400" : "text-amber-400"}`}>
                            {stage.passRate}%
                          </span>
                          <span className="text-xs text-gray-500">({stage.target}% target)</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${isAboveTarget ? "bg-green-500" : "bg-amber-500"}`}
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
