"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, CheckCircle, XCircle, ChevronRight } from "lucide-react"

interface QualityIssue {
  type: string
  count: number
  severity: "minor" | "major" | "critical"
}

interface StageQualityCardProps {
  stage: {
    name: string
    passRate: number
    target: number
    totalItems: number
    passedItems: number
    failedItems: number
    commonIssues: QualityIssue[]
    trend: "improving" | "declining" | "stable"
  }
  onViewDetails: () => void
}

export function StageQualityCard({ stage, onViewDetails }: StageQualityCardProps) {
  const getStatusColor = (passRate: number, target: number) => {
    if (passRate >= target) return "good"
    if (passRate >= target - 5) return "warning"
    return "critical"
  }

  const status = getStatusColor(stage.passRate, stage.target)

  const statusColors = {
    good: "border-green-500/30",
    warning: "border-amber-500/30",
    critical: "border-red-500/30",
  }

  const severityColors = {
    minor: "bg-blue-600",
    major: "bg-amber-600",
    critical: "bg-red-600",
  }

  return (
    <Card
      className={`bg-[#1a0d08] border-[#8B4513]/30 ${statusColors[status]} hover:border-[#d4a574]/50 transition-colors`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#d4a574] text-lg">{stage.name}</CardTitle>
          <div className="flex items-center gap-2">
            {status === "good" && <CheckCircle className="h-5 w-5 text-green-500" />}
            {status === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
            {status === "critical" && <XCircle className="h-5 w-5 text-red-500" />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Pass Rate</span>
            <span className="text-[#d4a574] font-medium">{stage.passRate}%</span>
          </div>
          <Progress value={stage.passRate} className="h-2" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>Target: {stage.target}%</span>
            <span>
              {stage.passedItems}/{stage.totalItems} passed
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[#d4a574]">Common Issues</h4>
          <div className="space-y-1">
            {stage.commonIssues.slice(0, 3).map((issue, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-gray-300 truncate">{issue.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-white">{issue.count}</span>
                  <Badge className={`${severityColors[issue.severity]} text-white text-xs px-1 py-0`}>
                    {issue.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#8B4513]/30">
          <div className="text-xs text-gray-400">
            Trend:{" "}
            <span
              className={
                stage.trend === "improving"
                  ? "text-green-400"
                  : stage.trend === "declining"
                    ? "text-red-400"
                    : "text-gray-400"
              }
            >
              {stage.trend}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="text-[#d4a574] hover:text-[#d4a574]/80 h-8 px-2"
          >
            Details
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
