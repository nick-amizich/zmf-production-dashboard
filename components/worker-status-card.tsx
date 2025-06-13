import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Wrench, Palette, Headphones } from "lucide-react"

interface WorkerStatusCardProps {
  worker: {
    id: string
    name: string
    avatar?: string
    currentTask: string
    stage: string
    status: "available" | "busy" | "break"
    skills: string[]
    timeElapsed: string
  }
}

const skillIcons = {
  Intake: Clock,
  Sanding: Wrench,
  Finishing: Palette,
  Assembly: Headphones,
  QC: Clock,
  Shipping: Clock,
}

export function WorkerStatusCard({ worker }: WorkerStatusCardProps) {
  const statusColors = {
    available: "bg-theme-status-success",
    busy: "bg-theme-status-warning",
    break: "bg-gray-600",
  }

  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary hover:border-theme-text-secondary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={worker.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-theme-brand-secondary text-theme-text-secondary">
              {worker.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h4 className="font-medium text-theme-text-secondary">{worker.name}</h4>
            <Badge className={`${statusColors[worker.status]} text-theme-text-primary text-xs`}>{worker.status}</Badge>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="text-theme-text-tertiary">
            <span className="text-theme-text-secondary">Stage:</span> {worker.stage}
          </div>
          <div className="text-theme-text-tertiary">
            <span className="text-theme-text-secondary">Task:</span> {worker.currentTask}
          </div>
          <div className="text-theme-text-tertiary">
            <span className="text-theme-text-secondary">Time:</span> {worker.timeElapsed}
          </div>
        </div>

        <div className="flex gap-1 mt-3">
          {worker.skills.map((skill) => {
            const Icon = skillIcons[skill as keyof typeof skillIcons] || Clock
            return (
              <div key={skill} className="p-1 bg-theme-brand-secondary/20 rounded text-theme-text-secondary" title={skill}>
                <Icon className="h-3 w-3" />
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
