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
    <Card className="bg-[#1a0d08] border-[#8B4513]/30">
      <CardHeader>
        <CardTitle className="text-[#d4a574] text-center">System Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4 text-[#d4a574]" />
              <span className="text-sm text-gray-400">Active Batches</span>
            </div>
            <div className="text-2xl font-bold text-white">{statusData.activeBatches}</div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Users className="h-4 w-4 text-[#d4a574]" />
              <span className="text-sm text-gray-400">Workers Online</span>
            </div>
            <div className="text-2xl font-bold text-white">{statusData.workersOnline}</div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-gray-400">Quality Issues</span>
            </div>
            <div className="text-2xl font-bold text-amber-500">{statusData.qualityIssues}</div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-400">Completed Today</span>
            </div>
            <div className="text-2xl font-bold text-green-500">{statusData.completedToday}</div>
          </div>
        </div>

        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">System Status:</span>
            <Badge className="bg-green-600 text-white">Online</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Last Update:</span>
            <span className="text-gray-300">2 minutes ago</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
