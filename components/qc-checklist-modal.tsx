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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a0d08] border-[#8B4513]/50 text-white">
        <DialogHeader className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            {isPreWork ? (
              <Search className="h-8 w-8 text-[#d4a574]" />
            ) : (
              <CheckCircle className="h-8 w-8 text-[#d4a574]" />
            )}
            <DialogTitle className="text-3xl font-bold text-[#d4a574]">
              {isPreWork ? `${stage} Quality Check` : `${stage} Quality Verification`}
            </DialogTitle>
          </div>

          <div className="text-center space-y-2">
            <p className="text-lg text-gray-300">
              {isPreWork ? "(Must complete before starting)" : `Work completed in: ${formatTime(workTime)}`}
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <span className="text-[#d4a574] font-medium">{batchInfo.batchNumber}</span>
              <span className="text-gray-400">•</span>
              {batchInfo.unitNumber && (
                <>
                  <span className="text-[#d4a574] font-medium">Unit {batchInfo.unitNumber}</span>
                  <span className="text-gray-400">•</span>
                </>
              )}
              <span className="text-[#d4a574] font-medium">{orderInfo.model}</span>
              {orderInfo.woodType !== "Mixed" && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-[#d4a574] font-medium">{orderInfo.woodType}</span>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 p-6">
          {/* Bulk Actions */}
          <div className="flex justify-center gap-4">
            <Button onClick={handleSelectAll} className="bg-[#8B4513] hover:bg-[#8B4513]/80 text-white px-6 py-2">
              <CheckSquare className="h-4 w-4 mr-2" />
              SELECT ALL
            </Button>
            <Button onClick={handleClearAll} className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2">
              <Square className="h-4 w-4 mr-2" />
              CLEAR ALL
            </Button>
          </div>

          {/* Checklist Items */}
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <Card key={category} className="bg-[#0a0a0a] border-[#8B4513]/30">
                <CardContent className="p-6">
                  {category !== "General" && <h3 className="text-xl font-bold text-[#d4a574] mb-4">{category}</h3>}

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-[#1a0d08] transition-colors"
                      >
                        <Checkbox
                          id={item.id}
                          checked={item.checked}
                          onCheckedChange={(checked) => handleItemCheck(item.id, checked as boolean)}
                          className="mt-1 h-6 w-6 border-[#8B4513] data-[state=checked]:bg-[#8B4513] data-[state=checked]:border-[#8B4513]"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={item.id}
                            className={`text-lg cursor-pointer ${item.checked ? "text-white" : "text-gray-300"} ${item.critical ? "font-medium" : ""}`}
                          >
                            {item.description}
                          </label>
                          {item.critical && <Badge className="ml-2 bg-red-600 text-white text-xs">CRITICAL</Badge>}
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
            <Card className="bg-amber-900/20 border-amber-600/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                  <p className="text-amber-100 font-medium">All items must be checked to begin work</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quality Assessment (Post-work only) */}
          {!isPreWork && (
            <Card className="bg-[#0a0a0a] border-[#8B4513]/30">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-xl font-bold text-[#d4a574]">Quality Assessment</h3>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-[#8B4513]/50 cursor-pointer">
                    <input
                      type="radio"
                      name="approval"
                      value="approved"
                      checked={approvalStatus === "approved"}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="h-5 w-5 text-[#8B4513]"
                    />
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-lg text-white">APPROVED - Ready for next stage</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-[#8B4513]/50 cursor-pointer">
                    <input
                      type="radio"
                      name="approval"
                      value="approved-but-fixed"
                      checked={approvalStatus === "approved-but-fixed"}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="h-5 w-5 text-[#8B4513]"
                    />
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                      <span className="text-lg text-white">APPROVED BUT FIXED - Issues corrected</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-[#8B4513]/50 cursor-pointer">
                    <input
                      type="radio"
                      name="approval"
                      value="rework-required"
                      checked={approvalStatus === "rework-required"}
                      onChange={(e) => setApprovalStatus(e.target.value as any)}
                      className="h-5 w-5 text-[#8B4513]"
                    />
                    <div className="flex items-center gap-2">
                      <XCircle className="h-5 w-5 text-red-400" />
                      <span className="text-lg text-white">REWORK REQUIRED - Send back for correction</span>
                    </div>
                  </label>
                </div>

                {approvalStatus === "approved-but-fixed" && (
                  <div className="space-y-2">
                    <label className="text-lg font-medium text-[#d4a574]">Issue Description (required):</label>
                    <Textarea
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      placeholder="Describe what was fixed..."
                      className="bg-[#1a0d08] border-[#8B4513]/30 text-white placeholder-gray-400 min-h-[100px] text-lg"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between gap-4">
            <Button onClick={onClose} className="h-14 bg-gray-600 hover:bg-gray-700 text-white text-lg px-8">
              Cancel
            </Button>

            <div className="flex gap-4">
              {isPreWork ? (
                <>
                  <Button
                    onClick={handleComplete}
                    disabled={!allItemsChecked}
                    className="h-14 bg-[#8B4513] hover:bg-[#8B4513]/80 text-white text-lg px-8 disabled:opacity-50"
                  >
                    <CheckCircle className="h-6 w-6 mr-2" />
                    APPROVED - BEGIN WORK
                  </Button>
                  <Button className="h-14 bg-red-600 hover:bg-red-700 text-white text-lg px-8">
                    <AlertTriangle className="h-6 w-6 mr-2" />
                    REPORT MAJOR ISSUE
                  </Button>
                </>
              ) : (
                <>
                  <Button className="h-14 bg-amber-600 hover:bg-amber-700 text-white text-lg px-8">
                    NEED SUPERVISOR
                  </Button>
                  <Button
                    onClick={handleComplete}
                    disabled={!approvalStatus || (approvalStatus === "approved-but-fixed" && !issueDescription.trim())}
                    className="h-14 bg-[#8B4513] hover:bg-[#8B4513]/80 text-white text-lg px-8 disabled:opacity-50"
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
