import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface MetricsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export function MetricsCard({ title, value, subtitle, icon: Icon, trend, trendValue }: MetricsCardProps) {
  const trendColors = {
    up: "text-green-400",
    down: "text-red-400",
    neutral: "text-gray-400",
  }

  return (
    <Card className="bg-[#1a0d08] border-[#8B4513]/30">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-[#d4a574]">{title}</CardTitle>
        <Icon className="h-4 w-4 text-[#8B4513]" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        {trend && trendValue && (
          <p className={`text-xs mt-1 ${trendColors[trend]}`}>
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
