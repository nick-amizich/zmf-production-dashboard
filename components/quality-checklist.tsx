"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Camera, CheckCircle, XCircle, AlertTriangle, ImageIcon } from "lucide-react"

interface QualityCheckItem {
  id: string
  description: string
  requiresPhoto: boolean
  status: "pending" | "pass" | "fail"
  notes?: string
  photoTaken?: boolean
}

interface QualityChecklistProps {
  stage: string
  items: QualityCheckItem[]
  onItemUpdate: (id: string, status: "pass" | "fail", notes?: string) => void
  onPhotoCapture: (itemId: string) => void
  onReportIssue: () => void
  onComplete: () => void
}

export function QualityChecklist({
  stage,
  items,
  onItemUpdate,
  onPhotoCapture,
  onReportIssue,
  onComplete,
}: QualityChecklistProps) {
  const [notes, setNotes] = useState("")
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  const allItemsCompleted = items.every((item) => item.status !== "pending")
  const hasFailures = items.some((item) => item.status === "fail")

  return (
    <div className="space-y-4">
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary text-xl">Quality Checklist - {stage}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="bg-theme-bg-primary border-theme-border-secondary">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-theme-text-primary text-lg">{item.description}</p>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => onItemUpdate(item.id, "pass")}
                      className={`flex-1 h-12 ${
                        item.status === "pass" ? "bg-theme-status-success hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Pass
                    </Button>

                    <Button
                      onClick={() => onItemUpdate(item.id, "fail")}
                      className={`flex-1 h-12 ${
                        item.status === "fail" ? "bg-theme-status-error hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      <XCircle className="h-5 w-5 mr-2" />
                      Fail
                    </Button>
                  </div>

                  {item.requiresPhoto && (
                    <Button
                      onClick={() => onPhotoCapture(item.id)}
                      className={`w-full h-12 ${
                        item.photoTaken ? "bg-theme-brand-secondary hover:bg-theme-brand-secondary/80" : "bg-theme-status-info hover:bg-blue-700"
                      }`}
                    >
                      {item.photoTaken ? (
                        <>
                          <ImageIcon className="h-5 w-5 mr-2" />
                          Photo Captured
                        </>
                      ) : (
                        <>
                          <Camera className="h-5 w-5 mr-2" />
                          Take Photo
                        </>
                      )}
                    </Button>
                  )}

                  {item.status !== "pending" && (
                    <Badge className={`${item.status === "pass" ? "bg-theme-status-success" : "bg-theme-status-error"} text-theme-text-primary`}>
                      {item.status === "pass" ? "PASSED" : "FAILED"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardContent className="p-4">
          <Textarea
            placeholder="Add notes about this stage..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-theme-bg-primary border-theme-border-primary text-theme-text-primary placeholder-gray-400 min-h-[100px] text-lg"
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={onReportIssue} className="flex-1 h-14 bg-theme-status-warning hover:bg-amber-700 text-theme-text-primary">
          <AlertTriangle className="h-6 w-6 mr-2" />
          Report Issue
        </Button>

        <Button
          onClick={onComplete}
          disabled={!allItemsCompleted}
          className={`flex-1 h-14 ${
            hasFailures ? "bg-theme-status-error hover:bg-red-700" : "bg-theme-status-success hover:bg-green-700"
          } text-theme-text-primary disabled:opacity-50`}
        >
          {hasFailures ? "Send to Rework" : "Complete Stage"}
        </Button>
      </div>
    </div>
  )
}
