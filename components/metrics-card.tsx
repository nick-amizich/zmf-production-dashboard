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
    up: "text-theme-status-success",
    down: "text-theme-status-error",
    neutral: "text-theme-text-tertiary",
  }

  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-theme-text-secondary">{title}</CardTitle>
        <Icon className="h-4 w-4 text-theme-brand-secondary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-theme-text-primary">{value}</div>
        {subtitle && <p className="text-xs text-theme-text-tertiary mt-1">{subtitle}</p>}
        {trend && trendValue && (
          <p className={`text-xs mt-1 ${trendColors[trend]}`}>
            {trend === "up" ? "↗" : trend === "down" ? "↘" : "→"} {trendValue}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
