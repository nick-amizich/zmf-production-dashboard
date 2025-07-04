"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, XCircle } from "lucide-react"
import { useState } from "react"

interface IssueDetail {
  id: string
  title: string
  severity: "critical" | "major" | "minor"
  stage: string
  reportedBy: string
  reportedDate: string
  model: string
  woodType: string
  description: string
}

const issuesByModel = {
  "Verite Closed": [
    {
      id: "QI-001",
      title: "Uneven stain coverage",
      severity: "major" as const,
      stage: "Finishing",
      reportedBy: "Kevin Chen",
      reportedDate: "2024-01-15",
      model: "Verite Closed",
      woodType: "Cocobolo",
      description: "Stain penetration inconsistent on left cup",
    },
    {
      id: "QI-005",
      title: "Driver seating issue",
      severity: "critical" as const,
      stage: "Sub-Assembly",
      reportedBy: "Sam Rodriguez",
      reportedDate: "2024-01-14",
      model: "Verite Closed",
      woodType: "Sapele",
      description: "Driver not seating properly in baffle",
    },
  ],
  "Caldera Open": [
    {
      id: "QI-002",
      title: "Frequency response deviation",
      severity: "major" as const,
      stage: "Acoustic QC",
      reportedBy: "Matt Wilson",
      reportedDate: "2024-01-16",
      model: "Caldera Open",
      woodType: "Cherry",
      description: "Response outside tolerance in 2-4kHz range",
    },
    {
      id: "QI-006",
      title: "Wood grain mismatch",
      severity: "minor" as const,
      stage: "Intake",
      reportedBy: "Tony Martinez",
      reportedDate: "2024-01-13",
      model: "Caldera Open",
      woodType: "Walnut",
      description: "Left and right cups show different grain patterns",
    },
  ],
  Atticus: [
    {
      id: "QI-003",
      title: "Surface roughness",
      severity: "minor" as const,
      stage: "Sanding",
      reportedBy: "Jake Thompson",
      reportedDate: "2024-01-12",
      model: "Atticus",
      woodType: "Padauk",
      description: "Surface finish not meeting smoothness standards",
    },
  ],
  Eikon: [
    {
      id: "QI-004",
      title: "Hardware alignment",
      severity: "major" as const,
      stage: "Final Assembly",
      reportedBy: "Jake Thompson",
      reportedDate: "2024-01-11",
      model: "Eikon",
      woodType: "Cherry",
      description: "Headband adjustment mechanism misaligned",
    },
  ],
}

const issuesByWoodType = {
  Cocobolo: [
    {
      id: "QI-001",
      title: "Uneven stain coverage",
      severity: "major" as const,
      stage: "Finishing",
      reportedBy: "Kevin Chen",
      reportedDate: "2024-01-15",
      model: "Verite Closed",
      woodType: "Cocobolo",
      description: "Stain penetration inconsistent on left cup",
    },
    {
      id: "QI-007",
      title: "Oil absorption variance",
      severity: "minor" as const,
      stage: "Finishing",
      reportedBy: "Kevin Chen",
      reportedDate: "2024-01-10",
      model: "Caldera Open",
      woodType: "Cocobolo",
      description: "Inconsistent oil absorption across surface",
    },
  ],
  Sapele: [
    {
      id: "QI-005",
      title: "Driver seating issue",
      severity: "critical" as const,
      stage: "Sub-Assembly",
      reportedBy: "Sam Rodriguez",
      reportedDate: "2024-01-14",
      model: "Verite Closed",
      woodType: "Sapele",
      description: "Driver not seating properly in baffle",
    },
  ],
  Cherry: [
    {
      id: "QI-002",
      title: "Frequency response deviation",
      severity: "major" as const,
      stage: "Acoustic QC",
      reportedBy: "Matt Wilson",
      reportedDate: "2024-01-16",
      model: "Caldera Open",
      woodType: "Cherry",
      description: "Response outside tolerance in 2-4kHz range",
    },
    {
      id: "QI-004",
      title: "Hardware alignment",
      severity: "major" as const,
      stage: "Final Assembly",
      reportedBy: "Jake Thompson",
      reportedDate: "2024-01-11",
      model: "Eikon",
      woodType: "Cherry",
      description: "Headband adjustment mechanism misaligned",
    },
  ],
  Walnut: [
    {
      id: "QI-006",
      title: "Wood grain mismatch",
      severity: "minor" as const,
      stage: "Intake",
      reportedBy: "Tony Martinez",
      reportedDate: "2024-01-13",
      model: "Caldera Open",
      woodType: "Walnut",
      description: "Left and right cups show different grain patterns",
    },
  ],
  Padauk: [
    {
      id: "QI-003",
      title: "Surface roughness",
      severity: "minor" as const,
      stage: "Sanding",
      reportedBy: "Jake Thompson",
      reportedDate: "2024-01-12",
      model: "Atticus",
      woodType: "Padauk",
      description: "Surface finish not meeting smoothness standards",
    },
  ],
}

interface IssuesByModelDashboardProps {
  onBack: () => void
}

export function IssuesByModelDashboard({ onBack }: IssuesByModelDashboardProps) {
  const [selectedIssue, setSelectedIssue] = useState<IssueDetail | null>(null)
  const [viewMode, setViewMode] = useState<"model" | "wood">("model")

  const severityColors = {
    critical: "bg-theme-status-error",
    major: "bg-theme-status-warning",
    minor: "bg-theme-status-info",
  }

  const stageColors = {
    Intake: "bg-theme-status-info",
    Sanding: "bg-theme-status-warning",
    Finishing: "bg-purple-600",
    "Sub-Assembly": "bg-theme-status-success",
    "Final Assembly": "bg-orange-600",
    "Acoustic QC": "bg-pink-600",
    Shipping: "bg-gray-600",
  }

  const currentData = viewMode === "model" ? issuesByModel : issuesByWoodType

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Quality Control
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-theme-text-secondary">
                Issues by {viewMode === "model" ? "Model" : "Wood Type"}
              </h1>
              <p className="text-sm text-theme-text-tertiary">Quality issues categorized by product specifications</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === "model" ? "default" : "outline"}
              onClick={() => setViewMode("model")}
              className={
                viewMode === "model"
                  ? "bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
                  : "border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20"
              }
            >
              By Model
            </Button>
            <Button
              variant={viewMode === "wood" ? "default" : "outline"}
              onClick={() => setViewMode("wood")}
              className={
                viewMode === "wood"
                  ? "bg-theme-brand-secondary hover:bg-theme-brand-secondary/80"
                  : "border-theme-border-active text-theme-text-secondary hover:bg-theme-brand-secondary/20"
              }
            >
              By Wood Type
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {Object.entries(currentData).map(([category, issues]) => (
            <Card key={category} className="bg-theme-bg-secondary border-theme-border-primary">
              <CardHeader>
                <CardTitle className="text-theme-text-secondary flex items-center justify-between">
                  {category}
                  <Badge className="bg-theme-brand-secondary text-theme-text-primary">{issues.length} issues</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {issues.map((issue) => (
                  <Card
                    key={issue.id}
                    className="bg-theme-bg-primary border-theme-border-secondary cursor-pointer hover:border-theme-text-secondary/50 transition-colors"
                    onClick={() => setSelectedIssue(issue)}
                  >
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-theme-text-secondary font-medium text-sm">{issue.id}</span>
                              <Badge className={`${severityColors[issue.severity]} text-theme-text-primary text-xs`}>
                                {issue.severity}
                              </Badge>
                            </div>
                            <h4 className="text-theme-text-primary font-medium text-sm">{issue.title}</h4>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <Badge className={`${stageColors[issue.stage as keyof typeof stageColors]} text-theme-text-primary`}>
                            {issue.stage}
                          </Badge>
                          <span className="text-theme-text-tertiary">{issue.reportedDate}</span>
                        </div>
                        <div className="text-xs text-theme-text-tertiary">
                          Reported by: <span className="text-theme-text-primary">{issue.reportedBy}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-theme-bg-primary/50 flex items-center justify-center p-4 z-50">
          <Card className="bg-theme-bg-secondary border-theme-border-primary max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-theme-text-secondary">Issue Details</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIssue(null)}
                  className="text-theme-text-tertiary hover:text-theme-text-primary"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-theme-text-tertiary">Issue ID</label>
                  <p className="text-theme-text-secondary font-medium">{selectedIssue.id}</p>
                </div>
                <div>
                  <label className="text-sm text-theme-text-tertiary">Severity</label>
                  <Badge className={`${severityColors[selectedIssue.severity]} text-theme-text-primary ml-2`}>
                    {selectedIssue.severity}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-theme-text-tertiary">Production Stage</label>
                  <Badge className={`${stageColors[selectedIssue.stage as keyof typeof stageColors]} text-theme-text-primary ml-2`}>
                    {selectedIssue.stage}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm text-theme-text-tertiary">Reported Date</label>
                  <p className="text-theme-text-primary">{selectedIssue.reportedDate}</p>
                </div>
                <div>
                  <label className="text-sm text-theme-text-tertiary">Model</label>
                  <p className="text-theme-text-primary">{selectedIssue.model}</p>
                </div>
                <div>
                  <label className="text-sm text-theme-text-tertiary">Wood Type</label>
                  <p className="text-theme-text-primary">{selectedIssue.woodType}</p>
                </div>
                <div>
                  <label className="text-sm text-theme-text-tertiary">Reported By</label>
                  <p className="text-theme-text-primary">{selectedIssue.reportedBy}</p>
                </div>
              </div>
              <div>
                <label className="text-sm text-theme-text-tertiary">Title</label>
                <p className="text-theme-text-primary font-medium">{selectedIssue.title}</p>
              </div>
              <div>
                <label className="text-sm text-theme-text-tertiary">Description</label>
                <p className="text-theme-text-primary">{selectedIssue.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
