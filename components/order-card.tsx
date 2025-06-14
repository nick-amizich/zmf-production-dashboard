import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { GripVertical, Clock, User } from "lucide-react"

interface OrderCardProps {
  order: {
    id: string
    orderNumber: string
    customerName: string
    model: string
    woodType: string
    currentStage: string
    progress: number
    assignedWorker: string | null
    timeElapsed: string
    qualityStatus: "good" | "warning" | "critical"
    dueDate: string
  }
}

export function OrderCard({ order }: OrderCardProps) {
  const qualityColors = {
    good: "bg-theme-status-success",
    warning: "bg-theme-status-warning",
    critical: "bg-theme-status-error",
  }

  const stageColors = {
    pending: "bg-gray-600",
    cups: "bg-theme-status-info",
    sanding: "bg-orange-600",
    finishing: "bg-purple-600",
    sub_assembly: "bg-teal-600",
    final_assembly: "bg-indigo-600",
    quality_control: "bg-pink-600",
    packaging: "bg-theme-status-success",
    complete: "bg-theme-status-success",
  }

  const formatStageName = (stage: string): string => {
    return stage
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-all cursor-move group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <GripVertical className="h-5 w-5 text-theme-brand-secondary mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-theme-text-secondary">{order.orderNumber}</h3>
                <p className="text-sm text-theme-text-tertiary flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {order.customerName}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full ${qualityColors[order.qualityStatus]}`}
                title={`Quality Status: ${order.qualityStatus}`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-theme-text-secondary">Model:</span>
                <p className="text-theme-text-tertiary">{order.model}</p>
              </div>
              <div>
                <span className="text-theme-text-secondary">Wood:</span>
                <p className="text-theme-text-tertiary">{order.woodType}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  className={`${stageColors[order.currentStage as keyof typeof stageColors] || "bg-gray-600"} text-theme-text-primary`}
                >
                  {formatStageName(order.currentStage)}
                </Badge>
                <span className="text-xs text-theme-text-tertiary">{order.progress}% complete</span>
              </div>
              <Progress value={order.progress} className="h-2 bg-theme-brand-secondary/20" />
            </div>

            <div className="flex items-center justify-between text-xs text-theme-text-tertiary">
              <div className="flex items-center gap-1">
                {order.assignedWorker ? (
                  <>
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-theme-brand-secondary text-theme-text-secondary text-xs">
                        {order.assignedWorker
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {order.assignedWorker}
                  </>
                ) : (
                  <span className="text-theme-text-tertiary">Unassigned</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {order.timeElapsed}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
