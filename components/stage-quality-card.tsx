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
    good: "border-theme-status-success/30",
    warning: "border-theme-status-warning/30",
    critical: "border-theme-status-error/30",
  }

  const severityColors = {
    minor: "bg-theme-status-info",
    major: "bg-theme-status-warning",
    critical: "bg-theme-status-error",
  }

  return (
    <Card
      className={`bg-theme-bg-secondary border-theme-border-primary ${statusColors[status]} hover:border-theme-text-secondary/50 transition-colors`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-theme-text-secondary text-lg">{stage.name}</CardTitle>
          <div className="flex items-center gap-2">
            {status === "good" && <CheckCircle className="h-5 w-5 text-theme-status-success" />}
            {status === "warning" && <AlertTriangle className="h-5 w-5 text-theme-status-warning" />}
            {status === "critical" && <XCircle className="h-5 w-5 text-theme-status-error" />}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-theme-text-tertiary">Pass Rate</span>
            <span className="text-theme-text-secondary font-medium">{stage.passRate}%</span>
          </div>
          <Progress value={stage.passRate} className="h-2" />
          <div className="flex justify-between text-xs text-theme-text-tertiary">
            <span>Target: {stage.target}%</span>
            <span>
              {stage.passedItems}/{stage.totalItems} passed
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-theme-text-secondary">Common Issues</h4>
          <div className="space-y-1">
            {stage.commonIssues.slice(0, 3).map((issue, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-theme-text-tertiary truncate">{issue.type}</span>
                <div className="flex items-center gap-2">
                  <span className="text-theme-text-primary">{issue.count}</span>
                  <Badge className={`${severityColors[issue.severity]} text-theme-text-primary text-xs px-1 py-0`}>
                    {issue.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-theme-border-primary">
          <div className="text-xs text-theme-text-tertiary">
            Trend:{" "}
            <span
              className={
                stage.trend === "improving"
                  ? "text-theme-status-success"
                  : stage.trend === "declining"
                    ? "text-theme-status-error"
                    : "text-theme-text-tertiary"
              }
            >
              {stage.trend}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewDetails}
            className="text-theme-text-secondary hover:text-theme-text-secondary/80 h-8 px-2"
          >
            Details
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
