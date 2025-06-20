"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, XCircle, Search, CheckSquare, Square } from "lucide-react"
import type { QCChecklistItem, QCApproval } from "../types/quality-control"
import { QC_CHECKLISTS } from "../data/qc-checklists"

interface QCChecklistModalProps {
  isOpen: boolean
  onClose: () => void
  stage: string
  batchInfo: {
    batchNumber: string
    unitNumber?: number
    totalUnits: number
  }
  orderInfo: {
    orderNumber: string
    model: string
    woodType: string
  }
  workTime?: number
  isPreWork: boolean
  onComplete: (approval: QCApproval, checklist: QCChecklistItem[]) => void
}

export default function QCChecklistModal({
  isOpen,
  onClose,
  stage,
  batchInfo,
  orderInfo,
  workTime = 0,
  isPreWork,
  onComplete,
}: QCChecklistModalProps) {
  const [checklist, setChecklist] = useState<QCChecklistItem[]>([])
  const [approvalStatus, setApprovalStatus] = useState<"approved" | "approved-but-fixed" | "rework-required" | "">("")
  const [issueDescription, setIssueDescription] = useState("")

  useEffect(() => {
    const stageChecklist = QC_CHECKLISTS[stage]
    if (stageChecklist) {
      setChecklist([...stageChecklist.items])
    }
  }, [stage])

  const handleItemCheck = (itemId: string, checked: boolean) => {
    setChecklist((prev) => prev.map((item) => (item.id === itemId ? { ...item, checked } : item)))
  }

  const handleSelectAll = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, checked: true })))
  }

  const handleClearAll = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, checked: false })))
  }

  const allItemsChecked = checklist.every((item) => item.checked)
  const criticalItemsChecked = checklist.filter((item) => item.critical).every((item) => item.checked)

  const handleComplete = () => {
    if (!approvalStatus) {
      alert("Please select an approval status")
      return
    }

    if (approvalStatus === "approved-but-fixed" && !issueDescription.trim()) {
      alert("Please describe what was fixed")
      return
    }

    if (isPreWork && !allItemsChecked) {
      alert("All intake items must be checked before beginning work")
      return
    }

    const approval: QCApproval = {
      status: approvalStatus,
      issueDescription: approvalStatus === "approved-but-fixed" ? issueDescription : undefined,
      timestamp: new Date(),
      worker: "Current Worker", // This would come from context
    }

    onComplete(approval, checklist)
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes} minutes`
  }

  const groupedItems = checklist.reduce(
    (groups, item) => {
      const category = item.category || "General"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(item)
      return groups
    },
    {} as Record<string, QCChecklistItem[]>,
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            {isPreWork ? (
              <Search className="h-8 w-8 text-theme-text-secondary" />
            ) : (
              <CheckCircle className="h-8 w-8 text-theme-text-secondary" />
            )}
            <DialogTitle className="text-3xl font-bold text-theme-text-secondary">
              {isPreWork ? `${stage} Quality Check` : `${stage} Quality Verification`}
            </DialogTitle>
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg text-theme-text-tertiary">
              {isPreWork ? "(Must complete before starting)" : `Work completed in: ${formatTime(workTime)}`}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-theme-text-secondary font-medium">{batchInfo.batchNumber}</span>
              <span className="text-theme-text-tertiary">•</span>
              {batchInfo.unitNumber && (
                <>
                  <span className="text-theme-text-secondary font-medium">Unit {batchInfo.unitNumber}</span>
                  <span className="text-theme-text-tertiary">•</span>
                </>
              )}
              <span className="text-theme-text-secondary font-medium">{orderInfo.model}</span>
              {orderInfo.woodType !== "Mixed" && (
                <>
                  <span className="text-theme-text-tertiary">•</span>
                  <span className="text-theme-text-secondary font-medium">{orderInfo.woodType}</span>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Bulk Actions */}
          <div className="flex justify-center gap-4">
            <Button onClick={handleSelectAll} className="bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary px-6 py-2">
              <CheckSquare className="h-4 w-4 mr-2" />
              SELECT ALL
            </Button>
            <Button onClick={handleClearAll} className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary px-6 py-2">
              <Square className="h-4 w-4 mr-2" />
              CLEAR ALL
            </Button>
          </div>

          {/* Checklist Items */}
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category} className="bg-theme-bg-primary border-theme-border-primary">
                <CardContent className="p-6">
                  {category !== "General" && <h3 className="text-xl font-bold text-theme-text-secondary mb-4">{category}</h3>}

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-theme-bg-secondary transition-colors"
                      >
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                          className="mt-1 h-6 w-6 border-theme-border-active data-[state=checked]:bg-theme-brand-secondary data-[state=checked]:border-theme-border-active"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={item.id}
                            className={`text-lg cursor-pointer ${item.checked ? "text-theme-text-primary" : "text-theme-text-tertiary"} ${item.critical ? "font-medium" : ""}`}
                          >
                            {item.description}
                          </label>
                          {item.critical && <Badge className="ml-2 bg-theme-status-error text-theme-text-primary text-xs">CRITICAL</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pre-work Warning */}
          {isPreWork && (
            <Card className="bg-amber-900/20 border-theme-status-warning/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-theme-status-warning" />
                  <p className="text-amber-100 font-medium">All items must be checked to begin work</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Assessment (Post-work only) */}
          {!isPreWork && (
            <Card className="bg-theme-bg-primary border-theme-border-primary">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-theme-text-secondary">Quality Assessment</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-theme-border-primary cursor-pointer">
                    <input
                      type="radio"
                      name="approval"
                      value="approved"
                      checked={approvalStatus === "approved"}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="h-5 w-5 text-theme-brand-secondary"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-theme-status-success" />
                      <span className="text-lg text-theme-text-primary">APPROVED - Ready for next stage</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-theme-border-primary cursor-pointer">
                    <input
                      type="radio"
                      name="approval"
                      value="approved-but-fixed"
                      checked={approvalStatus === "approved-but-fixed"}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="h-5 w-5 text-theme-brand-secondary"
                    />
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-theme-status-warning" />
                      <span className="text-lg text-theme-text-primary">APPROVED BUT FIXED - Issues corrected</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-theme-border-primary cursor-pointer">
                    <input
                      type="radio"
                      name="approval"
                      value="rework-required"
                      checked={approvalStatus === "rework-required"}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="h-5 w-5 text-theme-brand-secondary"
                    />
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-theme-status-error" />
                      <span className="text-lg text-theme-text-primary">REWORK REQUIRED - Send back for correction</span>
                    </div>
                  </label>
                </div>

                {approvalStatus === "approved-but-fixed" && (
                  <div className="space-y-2">
                    <label className="text-lg font-medium text-theme-text-secondary">Issue Description (required):</label>
                    <Textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Describe what was fixed..."
                      className="bg-theme-bg-secondary border-theme-border-primary text-theme-text-primary placeholder-gray-400 min-h-[100px] text-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button onClick={onClose} className="h-14 bg-gray-600 hover:bg-gray-700 text-theme-text-primary text-lg px-8">
              Cancel
            </Button>

            <div className="flex gap-4">
              {isPreWork ? (
                <>
                  <Button
                    onClick={handleComplete}
                    disabled={!allItemsChecked}
                    className="h-14 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary text-lg px-8 disabled:opacity-50"
                  >
                    <CheckCircle className="h-6 w-6 mr-2" />
                    APPROVED - BEGIN WORK
                  </Button>
                  <Button className="h-14 bg-theme-status-error hover:bg-red-700 text-theme-text-primary text-lg px-8">
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    REPORT MAJOR ISSUE
                  </Button>
                </>
              ) : (
                <>
                  <Button className="h-14 bg-theme-status-warning hover:bg-amber-700 text-theme-text-primary text-lg px-8">
                    NEED SUPERVISOR
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={!approvalStatus || (approvalStatus === "approved-but-fixed" && !issueDescription.trim())}
                    className="h-14 bg-theme-brand-secondary hover:bg-theme-brand-secondary/80 text-theme-text-primary text-lg px-8 disabled:opacity-50"
                  >
                    <CheckCircle className="h-6 w-6 mr-2" />
                    COMPLETE QC
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
