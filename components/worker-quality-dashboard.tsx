"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react"

interface WorkerQualityData {
  name: string
  overallScore: number
  trend: "up" | "down" | "stable"
  trendValue: string
  stageScores: {
    intake: number
    sanding: number
    finishing: number
    subAssembly: number
    finalAssembly: number
    acousticQC: number
    shipping: number
  }
  recentIssues: number
  recognition: boolean
  trainingNeeded: boolean
}

const workerQualityData: WorkerQualityData[] = [
  {
    name: "Tony Martinez",
    overallScore: 97.2,
    trend: "up",
    trendValue: "+1.2%",
    stageScores: {
      intake: 98.5,
      sanding: 96.8,
      finishing: 0, // Not assigned
      subAssembly: 0,
      finalAssembly: 0,
      acousticQC: 0,
      shipping: 0,
    },
    recentIssues: 1,
    recognition: true,
    trainingNeeded: false,
  },
  {
    name: "Jake Thompson",
    overallScore: 95.8,
    trend: "stable",
    trendValue: "0.0%",
    stageScores: {
      intake: 0,
      sanding: 96.2,
      finishing: 0,
      subAssembly: 94.8,
      finalAssembly: 96.4,
      acousticQC: 0,
      shipping: 0,
    },
    recentIssues: 2,
    recognition: false,
    trainingNeeded: false,
  },
  {
    name: "Kevin Chen",
    overallScore: 96.4,
    trend: "down",
    trendValue: "-0.8%",
    stageScores: {
      intake: 0,
      sanding: 0,
      finishing: 96.4,
      subAssembly: 0,
      finalAssembly: 0,
      acousticQC: 0,
      shipping: 0,
    },
    recentIssues: 3,
    recognition: false,
    trainingNeeded: true,
  },
  {
    name: "Matt Wilson",
    overallScore: 98.1,
    trend: "up",
    trendValue: "+2.1%",
    stageScores: {
      intake: 0,
      sanding: 0,
      finishing: 0,
      subAssembly: 0,
      finalAssembly: 97.8,
      acousticQC: 98.4,
      shipping: 0,
    },
    recentIssues: 0,
    recognition: true,
    trainingNeeded: false,
  },
  {
    name: "Laura Davis",
    overallScore: 99.2,
    trend: "up",
    trendValue: "+0.5%",
    stageScores: {
      intake: 0,
      sanding: 0,
      finishing: 0,
      subAssembly: 0,
      finalAssembly: 0,
      acousticQC: 98.8,
      shipping: 99.6,
    },
    recentIssues: 0,
    recognition: true,
    trainingNeeded: false,
  },
  {
    name: "Sam Rodriguez",
    overallScore: 94.3,
    trend: "down",
    trendValue: "-1.5%",
    stageScores: {
      intake: 0,
      sanding: 0,
      finishing: 0,
      subAssembly: 94.3,
      finalAssembly: 94.3,
      acousticQC: 0,
      shipping: 0,
    },
    recentIssues: 4,
    recognition: false,
    trainingNeeded: true,
  },
]

const stageNames = {
  intake: "Intake",
  sanding: "Sanding",
  finishing: "Finishing",
  subAssembly: "Sub-Assembly",
  finalAssembly: "Final Assembly",
  acousticQC: "Acoustic QC",
  shipping: "Shipping",
}

const stageColors = {
  intake: "bg-blue-600",
  sanding: "bg-amber-600",
  finishing: "bg-purple-600",
  subAssembly: "bg-green-600",
  finalAssembly: "bg-orange-600",
  acousticQC: "bg-pink-600",
  shipping: "bg-gray-600",
}

interface WorkerQualityDashboardProps {
  onBack: () => void
}

export function WorkerQualityDashboard({ onBack }: WorkerQualityDashboardProps) {
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
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] to-[#1a0d08] text-white">
      <header className="border-b border-[#8B4513]/30 bg-[#1a0d08]/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quality Control
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-[#d4a574]">Worker Quality Performance</h1>
              <p className="text-sm text-gray-400">Individual quality metrics by production stage</p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {workerQualityData.map((worker) => {
            const TrendIcon = getTrendIcon(worker.trend)
            return (
              <Card key={worker.name} className="bg-[#1a0d08] border-[#8B4513]/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-[#8B4513] text-[#d4a574]">
                          {worker.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{worker.name}</h3>
                        <div className="flex items-center gap-2">
                          {worker.recognition && <Award className="h-4 w-4 text-[#d4a574]" title="Top Performer" />}
                          {worker.trainingNeeded && (
                            <AlertTriangle className="h-4 w-4 text-amber-500" title="Training Needed" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(worker.overallScore)}`}>
                        {worker.overallScore}%
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${getTrendColor(worker.trend)}`}>
                        <TrendIcon className="h-4 w-4" />
                        <span>{worker.trendValue}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Progress value={worker.overallScore} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Overall Quality Score</span>
                      <span>Recent Issues: {worker.recentIssues}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-[#d4a574]">Stage Performance</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(worker.stageScores).map(([stage, score]) => {
                        if (score === 0) return null
                        return (
                          <div key={stage} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-gray-300">{stageNames[stage as keyof typeof stageNames]}</span>
                              <span className={getScoreColor(score)}>{score}%</span>
                            </div>
                            <Progress value={score} className="h-1" />
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {Object.entries(worker.stageScores).map(([stage, score]) => {
                      if (score === 0) return null
                      return (
                        <Badge
                          key={stage}
                          className={`${stageColors[stage as keyof typeof stageColors]} text-white text-xs`}
                        >
                          {stageNames[stage as keyof typeof stageNames]}
                        </Badge>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
