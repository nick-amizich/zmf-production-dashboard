"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react"

interface WorkerPerformance {
  name: string
  qualityScore: number
  trend: "up" | "down" | "stable"
  trendValue: string
  specialties: string[]
  recentIssues: number
  trainingNeeded: boolean
  recognition: boolean
}

const workerData: WorkerPerformance[] = [
  {
    name: "Tony Martinez",
    qualityScore: 97.2,
    trend: "up",
    trendValue: "+1.2%",
    specialties: ["Intake", "Sanding"],
    recentIssues: 1,
    trainingNeeded: false,
    recognition: true,
  },
  {
    name: "Jake Thompson",
    qualityScore: 95.8,
    trend: "stable",
    trendValue: "0.0%",
    specialties: ["Sanding", "Final Assembly"],
    recentIssues: 2,
    trainingNeeded: false,
    recognition: false,
  },
  {
    name: "Kevin Chen",
    qualityScore: 96.4,
    trend: "down",
    trendValue: "-0.8%",
    specialties: ["Finishing"],
    recentIssues: 3,
    trainingNeeded: true,
    recognition: false,
  },
  {
    name: "Matt Wilson",
    qualityScore: 98.1,
    trend: "up",
    trendValue: "+2.1%",
    specialties: ["Acoustic QC"],
    recentIssues: 0,
    trainingNeeded: false,
    recognition: true,
  },
  {
    name: "Laura Davis",
    qualityScore: 99.2,
    trend: "up",
    trendValue: "+0.5%",
    specialties: ["Shipping", "QC"],
    recentIssues: 0,
    trainingNeeded: false,
    recognition: true,
  },
  {
    name: "Sam Rodriguez",
    qualityScore: 94.3,
    trend: "down",
    trendValue: "-1.5%",
    specialties: ["Sub-Assembly", "Final Assembly"],
    recentIssues: 4,
    trainingNeeded: true,
    recognition: false,
  },
]

export function WorkerPerformancePanel() {
  const getScoreColor = (score: number) => {
    if (score >= 97) return "text-green-400"
    if (score >= 95) return "text-[#d4a574]"
    if (score >= 93) return "text-amber-400"
    return "text-red-400"
  }

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return TrendingUp
    if (trend === "down") return TrendingDown
    return TrendingUp
  }

  const getTrendColor = (trend: string) => {
    if (trend === "up") return "text-green-400"
    if (trend === "down") return "text-red-400"
    return "text-gray-400"
  }

  return (
    <Card className="bg-[#1a0d08] border-[#8B4513]/30">
      <CardHeader>
        <CardTitle className="text-[#d4a574]">Worker Quality Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {workerData.map((worker) => {
          const TrendIcon = getTrendIcon(worker.trend)
          return (
            <Card key={worker.name} className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-[#8B4513] text-[#d4a574]">
                          {worker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="text-white font-medium">{worker.name}</h4>
                        <div className="flex items-center gap-2">
                          {worker.recognition && <Award className="h-4 w-4 text-[#d4a574]" title="Top Performer" />}
                          {worker.trainingNeeded && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" title="Training Needed" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${getScoreColor(worker.qualityScore)}`}>
                        {worker.qualityScore}%
                      </div>
                      <div className={`flex items-center gap-1 text-xs ${getTrendColor(worker.trend)}`}>
                        <TrendIcon className="h-3 w-3" />
                        <span>{worker.trendValue}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Progress value={worker.qualityScore} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Target: 95%</span>
                      <span>Recent Issues: {worker.recentIssues}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {worker.specialties.map((specialty) => (
                      <Badge key={specialty} variant="outline" className="border-[#8B4513] text-[#d4a574] text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </CardContent>
    </Card>
  )
}
