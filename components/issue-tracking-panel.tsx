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
    critical: "bg-theme-status-error",
    major: "bg-theme-status-warning",
    minor: "bg-theme-status-info",
  }

  const statusColors = {
    open: "bg-theme-status-error",
    "in-progress": "bg-theme-status-warning",
    resolved: "bg-theme-status-success",
  }

  const statusIcons = {
    open: XCircle,
    "in-progress": Clock,
    resolved: CheckCircle,
  }

  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-theme-text-secondary">Active Quality Issues</CardTitle>
          <Badge className="bg-theme-brand-secondary text-theme-text-primary">{activeIssues.length} open</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
        {activeIssues.map((issue) => {
          const StatusIcon = statusIcons[issue.status]
          return (
            <Card key={issue.id} className="bg-theme-bg-primary border-theme-border-secondary">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-theme-text-secondary font-medium text-sm">{issue.id}</span>
                        <Badge className={`${severityColors[issue.severity]} text-theme-text-primary text-xs`}>
                          {issue.severity}
                        </Badge>
                        <Badge className={`${statusColors[issue.status]} text-theme-text-primary text-xs`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {issue.status}
                        </Badge>
                      </div>
                      <h4 className="text-theme-text-primary font-medium">{issue.title}</h4>
                      <p className="text-theme-text-tertiary text-sm mt-1">{issue.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-theme-text-tertiary">
                        Stage: <span className="text-theme-text-primary">{issue.stage}</span>
                      </span>
                      <span className="text-theme-text-tertiary">
                        Created: <span className="text-theme-text-primary">{issue.createdDate}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-theme-brand-secondary text-theme-text-secondary text-xs">
                          {issue.assignedTo
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-theme-text-tertiary text-sm">{issue.assignedTo}</span>
                    </div>
                    <Button variant="ghost" size="sm" className="text-theme-text-secondary hover:text-theme-text-secondary/80 h-6 px-2">
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
