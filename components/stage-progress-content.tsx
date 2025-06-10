"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import {
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  AlertTriangle,
  Zap,
  Award,
  BarChart3,
} from "lucide-react"

interface WorkTask {
  id: string
  orderNumber: string
  model: string
  woodType: string
  stage: string
  estimatedTime: string
  priority: "Standard" | "Rush" | "Expedite"
  customer: string
  batchInfo: {
    batchNumber: string
    unitNumber: number
    totalUnits: number
  }
  units: any[]
  workInstructions: any[]
  qualityChecks: any[]
  specialNotes?: string
}

interface StageProgressContentProps {
  currentTask: WorkTask | null
  todaysTasks: WorkTask[]
  currentTaskIndex: number
  workTime: number
}

export default function StageProgressContent({
  currentTask,
  todaysTasks,
  currentTaskIndex,
  workTime,
}: StageProgressContentProps) {
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}`
    }
    return `${minutes}:${seconds % 60 < 30 ? "00" : "30"}`
  }

  const parseTimeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(":").map(Number)
    return hours * 60 + minutes
  }

  const calculateDailyStats = () => {
    const completedTasks = currentTaskIndex
    const totalTasks = todaysTasks.length
    const totalEstimatedMinutes = todaysTasks.reduce((sum, task) => sum + parseTimeToMinutes(task.estimatedTime), 0)

    const completedMinutes =
      todaysTasks.slice(0, currentTaskIndex).reduce((sum, task) => sum + parseTimeToMinutes(task.estimatedTime), 0) +
      Math.floor(workTime / 60)

    const efficiency =
      completedMinutes > 0
        ? (completedMinutes / ((totalEstimatedMinutes * (completedTasks + 1)) / totalTasks)) * 100
        : 100

    const projectedFinishTime = new Date()
    const remainingMinutes = totalEstimatedMinutes - completedMinutes
    projectedFinishTime.setMinutes(projectedFinishTime.getMinutes() + remainingMinutes)

    return {
      completedTasks,
      totalTasks,
      efficiency: Math.round(efficiency),
      averagePerUnit: completedTasks > 0 ? Math.round(completedMinutes / completedTasks) : 0,
      projectedFinish: projectedFinishTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isAhead: efficiency > 105,
      isBehind: efficiency < 95,
    }
  }

  const generateTimelineItems = () => {
    const startTime = new Date()
    startTime.setHours(9, 0, 0, 0) // Assume 9 AM start

    return todaysTasks.map((task, index) => {
      const estimatedMinutes = parseTimeToMinutes(task.estimatedTime)
      const endTime = new Date(startTime.getTime() + estimatedMinutes * 60000)

      let status: "completed" | "in-progress" | "waiting" = "waiting"
      if (index < currentTaskIndex) status = "completed"
      else if (index === currentTaskIndex) status = "in-progress"

      const timelineItem = {
        task,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status,
        progress:
          index === currentTaskIndex
            ? Math.round((workTime / 60 / estimatedMinutes) * 100)
            : index < currentTaskIndex
              ? 100
              : 0,
      }

      // Update start time for next task
      startTime.setTime(endTime.getTime())

      return timelineItem
    })
  }

  const stats = calculateDailyStats()
  const timeline = generateTimelineItems()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case "in-progress":
        return <Clock className="h-5 w-5 text-amber-400" />
      case "waiting":
        return <Clock className="h-5 w-5 text-gray-400" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "in-progress":
        return "text-amber-400"
      case "waiting":
        return "text-gray-400"
      default:
        return "text-gray-400"
    }
  }

  const getPaceIndicator = () => {
    if (stats.isAhead) {
      return {
        icon: <TrendingUp className="h-5 w-5 text-green-400" />,
        text: "Ahead of Schedule",
        color: "text-green-400",
        bgColor: "bg-green-900/20 border-green-500/30",
      }
    } else if (stats.isBehind) {
      return {
        icon: <TrendingDown className="h-5 w-5 text-red-400" />,
        text: "Behind Schedule",
        color: "text-red-400",
        bgColor: "bg-red-900/20 border-red-500/30",
      }
    } else {
      return {
        icon: <Target className="h-5 w-5 text-blue-400" />,
        text: "On Track",
        color: "text-blue-400",
        bgColor: "bg-blue-900/20 border-blue-500/30",
      }
    }
  }

  const paceIndicator = getPaceIndicator()

  return (
    <div className="space-y-6">
      {/* Today's Targets vs Actual */}
      <Card className="bg-[#1a0d08] border-[#8B4513]/30">
        <CardHeader>
          <CardTitle className="text-xl text-[#d4a574] flex items-center gap-2">
            <Target className="h-6 w-6" />
            Today's Targets vs Actual
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{stats.projectedFinish}</div>
              <div className="text-sm text-gray-400">Projected Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-[#d4a574]">
                {stats.completedTasks}/{stats.totalTasks}
              </div>
              <div className="text-sm text-gray-400">Units Completed</div>
            </div>
          </div>

          <div className={`p-3 rounded border ${paceIndicator.bgColor}`}>
            <div className="flex items-center justify-center gap-2">
              {paceIndicator.icon}
              <span className={`font-medium ${paceIndicator.color}`}>{paceIndicator.text}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Timeline */}
      <Card className="bg-[#1a0d08] border-[#8B4513]/30">
        <CardHeader>
          <CardTitle className="text-xl text-[#d4a574] flex items-center gap-2">
            <Clock className="h-6 w-6" />
            Detailed Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {timeline.map((item, index) => (
            <div key={index} className="flex items-center gap-4 p-3 bg-[#0a0a0a]/50 rounded">
              <div className="flex-shrink-0">{getStatusIcon(item.status)}</div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">
                      Unit {index + 1}: {item.task.model} {item.task.woodType}
                    </span>
                    {item.task.priority !== "Standard" && (
                      <Badge
                        className={`text-xs ${
                          item.task.priority === "Expedite" ? "bg-red-600" : "bg-amber-600"
                        } text-white`}
                      >
                        {item.task.priority}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-400">
                    {item.startTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    -{" "}
                    {item.endTime.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-sm ${getStatusColor(item.status)}`}>
                    {item.status === "completed" && "✅ Complete"}
                    {item.status === "in-progress" && `🔄 In Progress (${item.progress}%)`}
                    {item.status === "waiting" && "⏳ Waiting"}
                  </span>

                  {item.status === "in-progress" && (
                    <div className="w-24">
                      <Progress value={item.progress} className="h-2" />
                    </div>
                  )}
                </div>

                {item.task.specialNotes && (
                  <div className="mt-2 text-xs text-amber-400 flex items-start gap-1">
                    <AlertTriangle className="h-3 w-3 flex-shrink-0 mt-0.5" />
                    {item.task.specialNotes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card className="bg-[#1a0d08] border-[#8B4513]/30">
        <CardHeader>
          <CardTitle className="text-xl text-[#d4a574] flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-[#0a0a0a]/50 rounded">
              <div className="text-2xl font-bold text-green-400">{stats.efficiency}%</div>
              <div className="text-sm text-gray-400">Daily Efficiency</div>
            </div>
            <div className="text-center p-3 bg-[#0a0a0a]/50 rounded">
              <div className="text-2xl font-bold text-[#d4a574]">{stats.averagePerUnit}min</div>
              <div className="text-sm text-gray-400">Average per Unit</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Quality Rate:</span>
              <span className="text-green-400 font-medium">100% first-pass</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Projected Finish:</span>
              <span className="text-[#d4a574] font-medium">{stats.projectedFinish}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pace Indicators Legend */}
      <Card className="bg-[#0a0a0a] border-[#8B4513]/20">
        <CardContent className="p-4">
          <h4 className="text-sm font-medium text-[#d4a574] mb-3">Pace Indicators</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-300">Ahead of Schedule (5%+ faster)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-gray-300">On Track (within ±5%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <span className="text-gray-300">Behind Schedule (5%+ slower)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button variant="outline" className="flex-1 border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
          <Zap className="h-4 w-4 mr-2" />
          Adjust Expectations
        </Button>
        <Button variant="outline" className="flex-1 border-[#8B4513] text-[#d4a574] hover:bg-[#8B4513]/20">
          <Award className="h-4 w-4 mr-2" />
          Request Help
        </Button>
      </div>
    </div>
  )
}
