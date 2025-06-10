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
    assignedWorker: string
    timeElapsed: string
    qualityStatus: "good" | "warning" | "critical"
    dueDate: string
  }
}

export function OrderCard({ order }: OrderCardProps) {
  const qualityColors = {
    good: "bg-green-600",
    warning: "bg-amber-600",
    critical: "bg-red-600",
  }

  const stageColors = {
    Intake: "bg-blue-600",
    Sanding: "bg-orange-600",
    Finishing: "bg-purple-600",
    "Sub-Assembly": "bg-teal-600",
    "Final Assembly": "bg-indigo-600",
    "Acoustic QC": "bg-pink-600",
    Shipping: "bg-green-600",
  }

  return (
    <Card className="bg-[#1a0d08] border-[#8B4513]/30 hover:border-[#d4a574]/50 transition-all cursor-move group">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <GripVertical className="h-5 w-5 text-[#8B4513] mt-1 opacity-50 group-hover:opacity-100 transition-opacity" />

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#d4a574]">{order.orderNumber}</h3>
                <p className="text-sm text-gray-300 flex items-center gap-1">
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
                <span className="text-[#d4a574]">Model:</span>
                <p className="text-gray-300">{order.model}</p>
              </div>
              <div>
                <span className="text-[#d4a574]">Wood:</span>
                <p className="text-gray-300">{order.woodType}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge
                  className={`${stageColors[order.currentStage as keyof typeof stageColors] || "bg-gray-600"} text-white`}
                >
                  {order.currentStage}
                </Badge>
                <span className="text-xs text-gray-400">{order.progress}% complete</span>
              </div>
              <Progress value={order.progress} className="h-2 bg-[#8B4513]/20" />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="bg-[#8B4513] text-[#d4a574] text-xs">
                    {order.assignedWorker
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {order.assignedWorker}
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
