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
      <Card className="bg-[#1a0d08] border-[#8B4513]/30">
        <CardHeader>
          <CardTitle className="text-[#d4a574] text-xl">Quality Checklist - {stage}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="bg-[#0a0a0a] border-[#8B4513]/20">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <p className="text-white text-lg">{item.description}</p>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => onItemUpdate(item.id, "pass")}
                      className={`flex-1 h-12 ${
                        item.status === "pass" ? "bg-green-600 hover:bg-green-700" : "bg-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Pass
                    </Button>

                    <Button
                      onClick={() => onItemUpdate(item.id, "fail")}
                      className={`flex-1 h-12 ${
                        item.status === "fail" ? "bg-red-600 hover:bg-red-700" : "bg-gray-600 hover:bg-gray-700"
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
                        item.photoTaken ? "bg-[#8B4513] hover:bg-[#8B4513]/80" : "bg-blue-600 hover:bg-blue-700"
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
                    <Badge className={`${item.status === "pass" ? "bg-green-600" : "bg-red-600"} text-white`}>
                      {item.status === "pass" ? "PASSED" : "FAILED"}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card className="bg-[#1a0d08] border-[#8B4513]/30">
        <CardContent className="p-4">
          <Textarea
            placeholder="Add notes about this stage..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-[#0a0a0a] border-[#8B4513]/30 text-white placeholder-gray-400 min-h-[100px] text-lg"
          />
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={onReportIssue} className="flex-1 h-14 bg-amber-600 hover:bg-amber-700 text-white">
          <AlertTriangle className="h-6 w-6 mr-2" />
          Report Issue
        </Button>

        <Button
          onClick={onComplete}
          disabled={!allItemsCompleted}
          className={`flex-1 h-14 ${
            hasFailures ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          } text-white disabled:opacity-50`}
        >
          {hasFailures ? "Send to Rework" : "Complete Stage"}
        </Button>
      </div>
    </div>
  )
}
