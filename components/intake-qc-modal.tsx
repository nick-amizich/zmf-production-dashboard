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
      <DialogContent className="max-w-2xl bg-[#2a1810] border-[#8B4513] text-white">
        <DialogHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-[#8B4513] rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-[#d4a574]" />
          </div>
          <DialogTitle className="text-2xl font-bold text-[#d4a574]">Intake Quality Check</DialogTitle>
          <p className="text-gray-300">Required before starting work</p>
        </DialogHeader>

        <Card className="bg-[#1a0d08] border-[#8B4513]/30 mb-6">
          <CardContent className="p-4">
            <div className="font-semibold text-[#d4a574]">
              {batchInfo.batchNumber} • {batchInfo.unitCount} Units • {batchInfo.model}
            </div>
            <div className="text-sm text-gray-300">
              Worker: {batchInfo.worker} • Stage: {batchInfo.stage}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <p className="font-medium text-[#d4a574]">Complete all checks before beginning:</p>

          <div className="max-h-80 overflow-y-auto space-y-3">
            {checklist.map((item) => (
              <Card key={item.id} className="bg-[#1a0d08] border-[#8B4513]/30 hover:bg-[#2a1810] transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id={item.id}
                      checked={item.checked}
                      onCheckedChange={() => handleCheckboxChange(item.id)}
                      className="mt-1 h-5 w-5 border-[#8B4513] data-[state=checked]:bg-[#8B4513] data-[state=checked]:border-[#8B4513]"
                    />
                    <div className="flex-1">
                      <label htmlFor={item.id} className="font-medium text-white cursor-pointer block">
                        {item.text}
                      </label>
                      <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button onClick={handleSelectAll} className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500">
            SELECT ALL
          </Button>
          <Button onClick={handleClearAll} className="bg-gray-600 hover:bg-gray-700 text-white border-gray-500">
            CLEAR ALL
          </Button>
        </div>

        {!allChecked && (
          <Card className="bg-amber-900/20 border-amber-600/30 mt-4">
            <CardContent className="p-3">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-amber-400 mr-2" />
                <span className="text-amber-100 font-medium">All items must be checked to begin work</span>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="mt-6 flex gap-3">
          <Button onClick={onClose} className="bg-gray-600 hover:bg-gray-700 text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK
          </Button>

          <Button onClick={onReportIssue} className="bg-red-600 hover:bg-red-700 text-white">
            <X className="w-4 h-4 mr-2" />
            REPORT ISSUE
          </Button>

          <Button
            onClick={handleStartWork}
            disabled={!allChecked}
            className={`${
              allChecked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-gray-400 text-gray-600 cursor-not-allowed"
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
