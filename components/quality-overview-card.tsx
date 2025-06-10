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
    good: "border-green-500/30 bg-green-500/5",
    warning: "border-amber-500/30 bg-amber-500/5",
    critical: "border-red-500/30 bg-red-500/5",
  }

  const trendIcons = {
    up: TrendingUp,
    down: TrendingDown,
    stable: Minus,
  }

  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    stable: "text-gray-400",
  }

  const TrendIcon = trendIcons[trend]

  return (
    <Card className={`bg-[#1a0d08] border-[#8B4513]/30 ${statusColors[status]}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#d4a574]">{title}</CardTitle>
        <Icon className="h-4 w-4 text-[#8B4513]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white mb-2">{value}</div>
        {target && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Target: {target}%</span>
              <span className="text-[#d4a574]">{typeof value === "string" ? value : `${value}%`}</span>
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
