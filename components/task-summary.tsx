"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, User } from "lucide-react"

interface TaskSummaryProps {
  order: {
    orderNumber: string
    customerName: string
    model: string
    woodType: string
    stage: string
  }
  completedChecks: number
  totalChecks: number
  passedChecks: number
  failedChecks: number
  photosCaptured: number
  timeElapsed: string
  workerName: string
  onConfirm: () => void
  onBack: () => void
}

export function TaskSummary({
  order,
  completedChecks,
  totalChecks,
  passedChecks,
  failedChecks,
  photosCaptured,
  timeElapsed,
  workerName,
  onConfirm,
  onBack,
}: TaskSummaryProps) {
  const hasFailures = failedChecks > 0

  return (
    <div className="space-y-6">
      <Card className="bg-[#1a0d08] border-[#8B4513]/30">
        <CardHeader>
          <CardTitle className="text-[#d4a574] text-xl">Task Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-[#0a0a0a] p-4 rounded-lg">
              <div className="text-2xl font-bold text-white">
                {completedChecks}/{totalChecks}
              </div>
              <div className="text-sm text-gray-400">Checks Completed</div>
            </div>
            <div className="bg-[#0a0a0a] p-4 rounded-lg">
              <div className="text-2xl font-bold text-[#d4a574]">{photosCaptured}</div>
              <div className="text-sm text-gray-400">Photos Captured</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Passed Checks:</span>
              <Badge className="bg-green-600 text-white">
                <CheckCircle className="h-4 w-4 mr-1" />
                {passedChecks}
              </Badge>
            </div>

            {failedChecks > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Failed Checks:</span>
                <Badge className="bg-red-600 text-white">
                  <XCircle className="h-4 w-4 mr-1" />
                  {failedChecks}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Time Elapsed:</span>
              <Badge className="bg-[#8B4513] text-white">
                <Clock className="h-4 w-4 mr-1" />
                {timeElapsed}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300">Worker:</span>
              <Badge className="bg-[#d4a574] text-[#1a0d08]">
                <User className="h-4 w-4 mr-1" />
                {workerName}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#1a0d08] border-[#8B4513]/30">
        <CardHeader>
          <CardTitle className="text-[#d4a574]">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-300">Order:</span>
            <span className="text-white font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Customer:</span>
            <span className="text-white">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Model:</span>
            <span className="text-white">{order.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Wood:</span>
            <span className="text-white">{order.woodType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Stage:</span>
            <span className="text-[#d4a574] font-medium">{order.stage}</span>
          </div>
        </CardContent>
      </Card>

      {hasFailures && (
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="h-5 w-5" />
              <span className="font-medium">Quality Issues Detected</span>
            </div>
            <p className="text-red-300 text-sm mt-2">
              This order will be sent to rework queue for quality issues to be addressed.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        <Button onClick={onBack} className="flex-1 h-14 bg-gray-600 hover:bg-gray-700 text-white">
          Back to Checklist
        </Button>

        <Button
          onClick={onConfirm}
          className={`flex-1 h-14 ${
            hasFailures ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          } text-white`}
        >
          {hasFailures ? "Send to Rework" : "Complete Stage"}
        </Button>
      </div>
    </div>
  )
}
