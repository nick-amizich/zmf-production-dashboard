"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Clock, XCircle, CheckCircle } from "lucide-react"

interface QualityIssue {
  id: string
  title: string
  stage: string
  severity: "critical" | "major" | "minor"
  status: "open" | "in-progress" | "resolved"
  assignedTo: string
  createdDate: string
  timeToResolve?: string
  description: string
}

const activeIssues: QualityIssue[] = [
  {
    id: "QI-001",
    title: "Uneven stain coverage on Cocobolo",
    stage: "Finishing",
    severity: "major",
    status: "in-progress",
    assignedTo: "Kevin Chen",
    createdDate: "2024-01-15",
    description: "Multiple units showing inconsistent stain penetration",
  },
  {
    id: "QI-002",
    title: "Driver seating tolerance issue",
    stage: "Sub-Assembly",
    severity: "critical",
    status: "open",
    assignedTo: "Sam Rodriguez",
    createdDate: "2024-01-16",
    description: "Drivers not seating properly in baffle assembly",
  },
  {
    id: "QI-003",
    title: "Wood grain mismatch in batch",
    stage: "Intake",
    severity: "minor",
    status: "in-progress",
    assignedTo: "Tony Martinez",
    createdDate: "2024-01-14",
    description: "Left and right cups showing different grain patterns",
  },
  {
    id: "QI-004",
    title: "Frequency response deviation",
    stage: "Acoustic QC",
    severity: "major",
    status: "open",
    assignedTo: "Matt Wilson",
    createdDate: "2024-01-16",
    description: "Units measuring outside tolerance in 2-4kHz range",
  },
]

export function IssueTrackingPanel() {
  const severityColors = {
    critical: "bg-red-600",
    major: "bg-amber-600",
    minor: "bg-blue-600",
  }

  const statusColors = {
    open: "bg-red-600",
    "in-progress": "bg-amber-600",
    resolved: "bg-green-600",
  }

  const statusIcons = {
    open: XCircle,
    "in-progress": Clock,
    resolved: CheckCircle,
  }

  return (
    <Card className="bg-[#1a0d08] border-[#8B4513]/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-[#d4a574]">Active Quality Issues</CardTitle>
          <Badge className="bg-[#8B4513] text-white">{activeIssues.length} open</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {activeIssues.map((issue) => {
          const StatusIcon = statusIcons[issue.status]
          return (
            <Card key={issue.id} className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#d4a574] font-medium text-sm">{issue.id}</span>
                        <Badge className={`${severityColors[issue.severity]} text-white text-xs`}>
                          {issue.severity}
                        </Badge>
                        <Badge className={`${statusColors[issue.status]} text-white text-xs`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {issue.status}
                        </Badge>
                      </div>
                      <h4 className="text-white font-medium">{issue.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{issue.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">
                        Stage: <span className="text-white">{issue.stage}</span>
                      </span>
                      <span className="text-gray-400">
                        Created: <span className="text-white">{issue.createdDate}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-[#8B4513] text-[#d4a574] text-xs">
                          {issue.assignedTo
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-gray-300 text-sm">{issue.assignedTo}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-[#d4a574] hover:text-[#d4a574]/80 h-6 px-2">
                      View Details
                    </Button>
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
