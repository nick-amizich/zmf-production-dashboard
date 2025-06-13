"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Search, MessageSquare, CheckCircle, Clock, Filter, User } from "lucide-react"
import { useReportedIssues, type ReportedIssue } from "../hooks/use-reported-issues"

interface ReportedIssuesDashboardProps {
  onBack: () => void
}

export function ReportedIssuesDashboard({ onBack }: ReportedIssuesDashboardProps) {
  const { issues, updateIssueStatus, getIssuesByType, getIssuesByStatus, searchIssues } = useReportedIssues()

  const [searchQuery, setSearchQuery] = useState("")
  const [issueTypeFilter, setIssueTypeFilter] = useState<
    "all" | "quality" | "equipment" | "material" | "safety" | "other"
  >("all")
  const [statusFilter, setStatusFilter] = useState<"all" | "open" | "in-progress" | "resolved">("all")
  const [selectedIssue, setSelectedIssue] = useState<ReportedIssue | null>(null)
  const [updateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<"open" | "in-progress" | "resolved">("open")
  const [resolution, setResolution] = useState("")

  // Filter issues based on search query and filters
  const filteredIssues = (() => {
    let result = issues

    // Apply search query
    if (searchQuery) {
      result = searchIssues(searchQuery)
    }

    // Apply issue type filter
    if (issueTypeFilter !== "all") {
      result = result.filter((issue) => issue.issueType === issueTypeFilter)
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((issue) => issue.status === statusFilter)
    }

    return result
  })()

  const handleUpdateStatus = () => {
    if (!selectedIssue) return

    updateIssueStatus(selectedIssue.id, newStatus, newStatus === "resolved" ? resolution : undefined, "Current Manager")

    setUpdateStatusDialogOpen(false)
    setSelectedIssue(null)
    setResolution("")
  }

  const getIssueTypeColor = (type: string) => {
    switch (type) {
      case "quality":
        return "bg-theme-status-error"
      case "equipment":
        return "bg-theme-status-info"
      case "material":
        return "bg-yellow-600"
      case "safety":
        return "bg-orange-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-theme-status-error"
      case "in-progress":
        return "bg-theme-status-warning"
      case "resolved":
        return "bg-theme-status-success"
      default:
        return "bg-gray-600"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-purple-600"
      case "high":
        return "bg-theme-status-error"
      case "medium":
        return "bg-theme-status-warning"
      case "low":
        return "bg-theme-status-info"
      default:
        return "bg-gray-600"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-theme-bg-primary to-theme-bg-secondary text-theme-text-primary">
      {/* Header */}
      <header className="border-b border-theme-border-primary bg-theme-bg-secondary/50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button onClick={onBack} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8 text-theme-text-secondary" />
              <div>
                <h1 className="text-2xl font-bold text-theme-text-secondary">Reported Issues</h1>
                <p className="text-sm text-theme-text-tertiary">Worker-reported production issues</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-theme-brand-secondary text-theme-text-primary text-sm px-3 py-1">{filteredIssues.length} Issues</Badge>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="px-6 py-4 border-b border-theme-border-primary bg-theme-bg-primary">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-theme-text-tertiary" />
            <Input
              placeholder="Search issues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary placeholder-gray-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-theme-text-secondary" />
            <span className="text-sm text-theme-text-tertiary">Filter by:</span>
          </div>

          <Select value={issueTypeFilter} onValueChange={(value) => setIssueTypeFilter(value as any)}>
            <SelectTrigger className="w-[160px] bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
              <SelectValue placeholder="Issue Type" />
            </SelectTrigger>
            <SelectContent className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="equipment">Equipment</SelectItem>
              <SelectItem value="material">Material</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
            <SelectTrigger className="w-[160px] bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Issues List */}
      <div className="p-6 space-y-4">
        {filteredIssues.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-theme-text-tertiary mb-4" />
            <h3 className="text-xl font-medium text-theme-text-tertiary">No issues found</h3>
            <p className="text-theme-text-tertiary mt-2">
              {searchQuery ? "Try adjusting your search or filters" : "All reported issues will appear here"}
            </p>
          </div>
        ) : (
          filteredIssues.map((issue) => (
            <Card
              key={issue.id}
              className={`bg-theme-bg-primary border-l-4 ${
                issue.status === "resolved"
                  ? "border-l-green-600"
                  : issue.priority === "critical"
                    ? "border-l-purple-600"
                    : issue.priority === "high"
                      ? "border-l-red-600"
                      : "border-l-[#8B4513]"
              } hover:bg-theme-bg-secondary transition-colors`}
            >
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {/* Worker Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-theme-bg-secondary flex items-center justify-center overflow-hidden">
                      {issue.workerPhoto ? (
                        <img
                          src={issue.workerPhoto || "/placeholder.svg"}
                          alt={issue.workerName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-theme-text-secondary" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-theme-text-primary">{issue.workerName}</div>
                      <div className="text-xs text-theme-text-tertiary flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(issue.timestamp)}
                      </div>
                    </div>
                  </div>

                  {/* Issue Content */}
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`${getIssueTypeColor(issue.issueType)} text-theme-text-primary`}>
                        {issue.issueType.toUpperCase()}
                      </Badge>
                      <Badge className={`${getStatusColor(issue.status)} text-theme-text-primary`}>
                        {issue.status === "in-progress" ? "IN PROGRESS" : issue.status.toUpperCase()}
                      </Badge>
                      <Badge className={`${getPriorityColor(issue.priority)} text-theme-text-primary`}>
                        {issue.priority.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-theme-text-tertiary">
                        {issue.stage} • {issue.model} • {issue.batchNumber}
                      </span>
                    </div>

                    <p className="text-theme-text-tertiary">{issue.description}</p>

                    {issue.status === "resolved" && issue.resolution && (
                      <div className="bg-green-900/20 border border-green-900/30 rounded p-3 mt-2">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="h-4 w-4 text-theme-status-success" />
                          <span className="text-theme-status-success font-medium">Resolution</span>
                        </div>
                        <p className="text-theme-text-tertiary text-sm">{issue.resolution}</p>
                        <div className="text-xs text-theme-text-tertiary mt-1">
                          Resolved by {issue.resolvedBy} on {issue.resolvedAt && formatDate(issue.resolvedAt)}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col gap-2 self-start">
                    <Button
                      onClick={() => setSelectedIssue(issue)}
                      className="bg-theme-bg-secondary hover:bg-theme-brand-secondary/30 text-theme-text-primary border border-theme-border-primary"
                      size="sm"
                    >
                      View Details
                    </Button>
                    {issue.status !== "resolved" && (
                      <Button
                        onClick={() => {
                          setSelectedIssue(issue)
                          setNewStatus(issue.status)
                          setUpdateStatusDialogOpen(true)
                        }}
                        className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
                        size="sm"
                      >
                        Update Status
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Issue Detail Dialog */}
      {selectedIssue && (
        <Dialog open={!!selectedIssue && !updateStatusDialogOpen} onOpenChange={() => setSelectedIssue(null)}>
          <DialogContent className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-theme-text-secondary text-2xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6" />
                Issue Details
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-theme-bg-primary flex items-center justify-center overflow-hidden">
                  {selectedIssue.workerPhoto ? (
                    <img
                      src={selectedIssue.workerPhoto || "/placeholder.svg"}
                      alt={selectedIssue.workerName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-7 w-7 text-theme-text-secondary" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-theme-text-primary text-lg">{selectedIssue.workerName}</div>
                  <div className="text-sm text-theme-text-tertiary flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(selectedIssue.timestamp)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-theme-text-tertiary">Stage</div>
                  <div className="text-theme-text-primary font-medium">{selectedIssue.stage}</div>
                </div>
                <div>
                  <div className="text-theme-text-tertiary">Model</div>
                  <div className="text-theme-text-primary font-medium">{selectedIssue.model}</div>
                </div>
                <div>
                  <div className="text-theme-text-tertiary">Batch Number</div>
                  <div className="text-theme-text-primary font-medium">{selectedIssue.batchNumber}</div>
                </div>
                <div>
                  <div className="text-theme-text-tertiary">Status</div>
                  <Badge className={`${getStatusColor(selectedIssue.status)} text-theme-text-primary mt-1`}>
                    {selectedIssue.status === "in-progress" ? "IN PROGRESS" : selectedIssue.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-theme-text-tertiary mb-2">Issue Type</div>
                <Badge className={`${getIssueTypeColor(selectedIssue.issueType)} text-theme-text-primary`}>
                  {selectedIssue.issueType.toUpperCase()}
                </Badge>
              </div>

              <div>
                <div className="text-theme-text-tertiary mb-2">Description</div>
                <div className="bg-theme-bg-primary border border-theme-border-primary rounded-md p-4 text-theme-text-primary">
                  {selectedIssue.description}
                </div>
              </div>

              {selectedIssue.status === "resolved" && selectedIssue.resolution && (
                <div>
                  <div className="text-theme-text-tertiary mb-2">Resolution</div>
                  <div className="bg-green-900/20 border border-green-900/30 rounded-md p-4">
                    <p className="text-theme-text-tertiary">{selectedIssue.resolution}</p>
                    <div className="text-xs text-theme-text-tertiary mt-2">
                      Resolved by {selectedIssue.resolvedBy} on{" "}
                      {selectedIssue.resolvedAt && formatDate(selectedIssue.resolvedAt)}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button onClick={() => setSelectedIssue(null)} className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary">
                  Close
                </Button>
                {selectedIssue.status !== "resolved" && (
                  <Button
                    onClick={() => {
                      setNewStatus(selectedIssue.status)
                      setUpdateStatusDialogOpen(true)
                    }}
                    className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
                  >
                    Update Status
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Update Status Dialog */}
      <Dialog open={updateStatusDialogOpen} onOpenChange={setUpdateStatusDialogOpen}>
        <DialogContent className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
          <DialogHeader>
            <DialogTitle className="text-theme-text-secondary">Update Issue Status</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-theme-text-secondary">Status:</label>
              <Select value={newStatus} onValueChange={(value) => setNewStatus(value as any)}>
                <SelectTrigger className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary">
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === "resolved" && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-theme-text-secondary">Resolution:</label>
                <Textarea
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  placeholder="Describe how the issue was resolved..."
                  className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder-gray-400 min-h-[100px]"
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setUpdateStatusDialogOpen(false)}
              className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStatus}
              disabled={newStatus === "resolved" && !resolution.trim()}
              className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary"
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
