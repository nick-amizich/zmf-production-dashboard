"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Search, CheckCircle, X, ArrowLeft, AlertCircle } from "lucide-react"

interface IntakeQCItem {
  id: string
  text: string
  description: string
  checked: boolean
}

interface BatchInfo {
  batchNumber: string
  unitCount: number
  model: string
  worker: string
  stage: string
}

interface IntakeQCModalProps {
  isOpen: boolean
  onClose: () => void
  onStartWork: () => void
  onReportIssue: () => void
  batchInfo: BatchInfo
}

export default function IntakeQCModal({ isOpen, onClose, onStartWork, onReportIssue, batchInfo }: IntakeQCModalProps) {
  const [checklist, setChecklist] = useState<IntakeQCItem[]>([
    {
      id: "cup_count",
      text: "Cup count verification",
      description: "Ensure number of cups matches shipping manifest",
      checked: false,
    },
    {
      id: "grade_check",
      text: "Grade check",
      description: "Confirm all cups are A stock, identify any B stock",
      checked: false,
    },
    {
      id: "wood_type",
      text: "Wood type validation",
      description: "Verify wood species matches order specifications",
      checked: false,
    },
    {
      id: "lr_pairing",
      text: "Left/Right pairing",
      description: "Ensure cups are correctly matched as pairs",
      checked: false,
    },
    {
      id: "matching_pairs",
      text: "Matching pairs verification",
      description: "Left and right cups match for each unit",
      checked: false,
    },
    {
      id: "grain_consistency",
      text: "Wood grain consistency",
      description: "Check grain patterns are consistent for paired units",
      checked: false,
    },
  ])

  const allChecked = checklist.every((item) => item.checked)

  const handleCheckboxChange = (id: string) => {
    setChecklist((prev) => prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const handleSelectAll = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, checked: true })))
  }

  const handleClearAll = () => {
    setChecklist((prev) => prev.map((item) => ({ ...item, checked: false })))
  }

  const handleStartWork = () => {
    if (allChecked) {
      onStartWork()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-theme-bg-tertiary border-theme-border-active text-theme-text-primary">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-theme-brand-secondary rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-theme-text-secondary" />
          </div>
          <DialogTitle className="text-2xl font-bold text-theme-text-secondary">Intake Quality Check</DialogTitle>
          <p className="text-theme-text-tertiary">Required before starting work</p>
        </DialogHeader>

        <Card className="bg-theme-bg-secondary border-theme-border-primary mb-6">
          <CardContent className="p-4">
            <div className="font-semibold text-theme-text-secondary">
              {batchInfo.batchNumber} • {batchInfo.unitCount} Units • {batchInfo.model}
            </div>
            <div className="text-sm text-theme-text-tertiary">
              Worker: {batchInfo.worker} • Stage: {batchInfo.stage}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <p className="font-medium text-theme-text-secondary">Complete all checks before beginning:</p>

          <div className="max-h-80 overflow-y-auto space-y-3">
            {checklist.map((item) => (
              <Card key={item.id} className="bg-theme-bg-secondary border-theme-border-primary hover:bg-theme-bg-tertiary transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={() => handleCheckboxChange(item.id)}
                      className="mt-1 h-5 w-5 border-theme-border-active data-[state=checked]:bg-theme-brand-secondary data-[state=checked]:border-theme-border-active"
                    />
                    <div className="flex-1">
                      <label htmlFor={item.id} className="font-medium text-theme-text-primary cursor-pointer block">
                        {item.text}
                      </label>
                      <p className="text-sm text-theme-text-tertiary mt-1">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSelectAll} className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary border-gray-500">
            SELECT ALL
          </Button>
          <Button onClick={handleClearAll} className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary border-gray-500">
            CLEAR ALL
          </Button>
        </div>

        {!allChecked && (
          <Card className="bg-amber-900/20 border-theme-status-warning/30 mt-4">
            <CardContent className="p-3">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-theme-status-warning mr-2" />
                <span className="text-amber-100 font-medium">All items must be checked to begin work</span>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="mt-6 flex gap-3">
          <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-theme-text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK
          </Button>

          <Button onClick={onReportIssue} className="bg-theme-status-error hover:bg-red-700 text-theme-text-primary">
            <X className="w-4 h-4 mr-2" />
            REPORT ISSUE
          </Button>

          <Button
            onClick={handleStartWork}
            disabled={!allChecked}
            className={`${
              allChecked ? "bg-theme-status-success hover:bg-green-700 text-theme-text-primary" : "bg-gray-400 text-theme-text-tertiary cursor-not-allowed"
            }`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            START WORK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
