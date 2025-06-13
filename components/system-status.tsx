"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, AlertTriangle, CheckCircle } from "lucide-react"

export function SystemStatus() {
  const statusData = {
    activeBatches: 12,
    workersOnline: 6,
    qualityIssues: 2,
    completedToday: 8,
  }

  return (
    <Card className="bg-theme-bg-secondary border-theme-border-primary">
      <CardHeader>
        <CardTitle className="text-theme-text-secondary text-center">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-theme-text-secondary" />
              <span className="text-sm text-theme-text-tertiary">Active Batches</span>
            </div>
            <div className="text-2xl font-bold text-theme-text-primary">{statusData.activeBatches}</div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4 text-theme-text-secondary" />
              <span className="text-sm text-theme-text-tertiary">Workers Online</span>
            </div>
            <div className="text-2xl font-bold text-theme-text-primary">{statusData.workersOnline}</div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-theme-status-warning" />
              <span className="text-sm text-theme-text-tertiary">Quality Issues</span>
            </div>
            <div className="text-2xl font-bold text-theme-status-warning">{statusData.qualityIssues}</div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-theme-status-success" />
              <span className="text-sm text-theme-text-tertiary">Completed Today</span>
            </div>
            <div className="text-2xl font-bold text-theme-status-success">{statusData.completedToday}</div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-theme-text-tertiary">System Status:</span>
            <Badge className="bg-theme-status-success text-theme-text-primary">Online</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-theme-text-tertiary">Last Update:</span>
            <span className="text-theme-text-tertiary">2 minutes ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
