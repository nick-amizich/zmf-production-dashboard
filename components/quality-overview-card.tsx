"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface QualityOverviewCardProps {
  title: string
  value: string | number
  target?: number
  trend: "up" | "down" | "stable"
  trendValue: string
  icon: LucideIcon
  status: "good" | "warning" | "critical"
}

export function QualityOverviewCard({
  title,
  value,
  target,
  trend,
  trendValue,
  icon: Icon,
  status,
}: QualityOverviewCardProps) {
  const statusColors = {
    good: "border-theme-status-success/30 bg-theme-status-success/5",
    warning: "border-theme-status-warning/30 bg-theme-status-warning/5",
    critical: "border-theme-status-error/30 bg-theme-status-error/5",
  }

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  }

  const trendColors = {
    up: "text-theme-status-success",
    down: "text-theme-status-error",
    stable: "text-theme-text-tertiary",
  }

  const TrendIcon = trendIcons[trend]

  return (
    <Card className={`bg-theme-bg-secondary border-theme-border-primary ${statusColors[status]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-theme-text-secondary">{title}</CardTitle>
        <Icon className="h-4 w-4 text-theme-brand-secondary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-theme-text-primary mb-2">{value}</div>
        {target && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-theme-text-tertiary">Target: {target}%</span>
              <span className="text-theme-text-secondary">{typeof value === "string" ? value : `${value}%`}</span>
            </div>
            <Progress value={typeof value === "number" ? value : Number.parseFloat(value.toString())} className="h-2" />
          </div>
        )}
        <div className={`flex items-center gap-1 text-xs mt-2 ${trendColors[trend]}`}>
          <TrendIcon className="h-3 w-3" />
          <span>{trendValue}</span>
        </div>
      </CardContent>
    </Card>
  )
}
