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
      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary text-xl">Task Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-theme-bg-primary p-4 rounded-lg">
              <div className="text-2xl font-bold text-theme-text-primary">
                {completedChecks}/{totalChecks}
              </div>
              <div className="text-sm text-theme-text-tertiary">Checks Completed</div>
            </div>
            <div className="bg-theme-bg-primary p-4 rounded-lg">
              <div className="text-2xl font-bold text-theme-text-secondary">{photosCaptured}</div>
              <div className="text-sm text-theme-text-tertiary">Photos Captured</div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-theme-text-tertiary">Passed Checks:</span>
              <Badge className="bg-theme-status-success text-theme-text-primary">
                <CheckCircle className="h-4 w-4 mr-1" />
                {passedChecks}
              </Badge>
            </div>

            {failedChecks > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-theme-text-tertiary">Failed Checks:</span>
                <Badge className="bg-theme-status-error text-theme-text-primary">
                  <XCircle className="h-4 w-4 mr-1" />
                  {failedChecks}
                </Badge>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-theme-text-tertiary">Time Elapsed:</span>
              <Badge className="bg-theme-brand-secondary text-theme-text-primary">
                <Clock className="h-4 w-4 mr-1" />
                {timeElapsed}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-theme-text-tertiary">Worker:</span>
              <Badge className="bg-theme-brand-primary text-theme-bg-secondary">
                <User className="h-4 w-4 mr-1" />
                {workerName}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-theme-bg-secondary border-theme-border-primary">
        <CardHeader>
          <CardTitle className="text-theme-text-secondary">Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-theme-text-tertiary">Order:</span>
            <span className="text-theme-text-primary font-medium">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-text-tertiary">Customer:</span>
            <span className="text-theme-text-primary">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-text-tertiary">Model:</span>
            <span className="text-theme-text-primary">{order.model}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-text-tertiary">Wood:</span>
            <span className="text-theme-text-primary">{order.woodType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-theme-text-tertiary">Stage:</span>
            <span className="text-theme-text-secondary font-medium">{order.stage}</span>
          </div>
        </CardContent>
      </Card>

      {hasFailures && (
        <Card className="bg-red-900/20 border-theme-status-error/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-theme-status-error">
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
        <Button onClick={onBack} className="flex-1 h-14 bg-gray-600 hover:bg-gray-700 text-theme-text-primary">
          Back to Checklist
        </Button>

        <Button
          onClick={onConfirm}
          className={`flex-1 h-14 ${
            hasFailures ? "bg-theme-status-error hover:bg-red-700" : "bg-theme-status-success hover:bg-green-700"
          } text-theme-text-primary`}
        >
          {hasFailures ? "Send to Rework" : "Complete Stage"}
        </Button>
      </div>
    </div>
  )
}
