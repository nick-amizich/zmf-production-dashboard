"use client"

import { useState } from "react"

export interface ReportedIssue {
  id: string
  workerName: string
  workerPhoto?: string
  stage: string
  batchNumber: string
  model: string
  issueType: "quality" | "equipment" | "material" | "safety" | "other"
  description: string
  timestamp: Date
  status: "open" | "in-progress" | "resolved"
  priority: "low" | "medium" | "high" | "critical"
  resolution?: string
  resolvedBy?: string
  resolvedAt?: Date
}

// Sample data
const sampleIssues: ReportedIssue[] = [
  {
    id: "issue-1",
    workerName: "Tony S.",
    workerPhoto: "/placeholder.svg?height=40&width=40&text=TS",
    stage: "Intake",
    batchNumber: "BATCH-2024-001",
    model: "Verite Closed",
    issueType: "quality",
    description: "Multiple cups showing inconsistent grain patterns that don't match the requested specifications.",
    timestamp: new Date(2024, 5, 8, 14, 30),
    status: "open",
    priority: "high",
  },
  {
    id: "issue-2",
    workerName: "Jake M.",
    workerPhoto: "/placeholder.svg?height=40&width=40&text=JM",
    stage: "Sanding",
    batchNumber: "BATCH-2024-002",
    model: "Caldera Open",
    issueType: "equipment",
    description: "Sanding machine #3 is producing inconsistent results. The belt appears to be wearing unevenly.",
    timestamp: new Date(2024, 5, 7, 10, 15),
    status: "in-progress",
    priority: "medium",
  },
  {
    id: "issue-3",
    workerName: "Kevin R.",
    workerPhoto: "/placeholder.svg?height=40&width=40&text=KR",
    stage: "Finishing",
    batchNumber: "BATCH-2024-003",
    model: "Auteur",
    issueType: "material",
    description:
      "New batch of stain appears to be slightly different color than previous batches. Creating inconsistency.",
    timestamp: new Date(2024, 5, 6, 16, 45),
    status: "resolved",
    priority: "high",
    resolution: "Contacted supplier and received replacement batch with correct color match.",
    resolvedBy: "Matt W.",
    resolvedAt: new Date(2024, 5, 7, 9, 30),
  },
  {
    id: "issue-4",
    workerName: "Matt W.",
    workerPhoto: "/placeholder.svg?height=40&width=40&text=MW",
    stage: "Acoustic QC",
    batchNumber: "BATCH-2024-004",
    model: "Verite Open",
    issueType: "safety",
    description: "Exposed wire on test equipment creating potential shock hazard.",
    timestamp: new Date(2024, 5, 9, 8, 20),
    status: "open",
    priority: "critical",
  },
  {
    id: "issue-5",
    workerName: "Laura J.",
    workerPhoto: "/placeholder.svg?height=40&width=40&text=LJ",
    stage: "Shipping",
    batchNumber: "BATCH-2024-005",
    model: "Eikon",
    issueType: "other",
    description: "New shipping boxes are slightly smaller than previous ones, causing tight fit for some models.",
    timestamp: new Date(2024, 5, 5, 11, 10),
    status: "in-progress",
    priority: "low",
  },
]

export function useReportedIssues() {
  const [issues, setIssues] = useState<ReportedIssue[]>(sampleIssues)

  const addIssue = (issue: ReportedIssue) => {
    setIssues((prev) => [issue, ...prev])
  }

  const updateIssueStatus = (
    issueId: string,
    status: "open" | "in-progress" | "resolved",
    resolution?: string,
    resolvedBy?: string,
  ) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          return {
            ...issue,
            status,
            resolution: status === "resolved" ? resolution : issue.resolution,
            resolvedBy: status === "resolved" ? resolvedBy : issue.resolvedBy,
            resolvedAt: status === "resolved" ? new Date() : issue.resolvedAt,
          }
        }
        return issue
      }),
    )
  }

  const getIssuesByType = (type: "quality" | "equipment" | "material" | "safety" | "other" | "all") => {
    if (type === "all") return issues
    return issues.filter((issue) => issue.issueType === type)
  }

  const getIssuesByStatus = (status: "open" | "in-progress" | "resolved" | "all") => {
    if (status === "all") return issues
    return issues.filter((issue) => issue.status === status)
  }

  const getIssuesByStage = (stage: string) => {
    return issues.filter((issue) => issue.stage === stage)
  }

  const getIssuesByModel = (model: string) => {
    return issues.filter((issue) => issue.model === model)
  }

  const searchIssues = (query: string) => {
    const lowerQuery = query.toLowerCase()
    return issues.filter(
      (issue) =>
        issue.description.toLowerCase().includes(lowerQuery) ||
        issue.workerName.toLowerCase().includes(lowerQuery) ||
        issue.model.toLowerCase().includes(lowerQuery) ||
        issue.batchNumber.toLowerCase().includes(lowerQuery) ||
        issue.stage.toLowerCase().includes(lowerQuery),
    )
  }

  return {
    issues,
    addIssue,
    updateIssueStatus,
    getIssuesByType,
    getIssuesByStatus,
    getIssuesByStage,
    getIssuesByModel,
    searchIssues,
  }
}
