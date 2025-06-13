'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { QualityMetrics } from './quality-metrics'
import { ActiveIssues } from './active-issues'
import { QualityCheckForm } from './quality-check-form'
import { RecentChecks } from './recent-checks'
import { Database } from '@/types/database.types'

type Batch = Database['public']['Tables']['batches']['Row']
type WorkerRole = Database['public']['Enums']['worker_role']

interface QualityDashboardProps {
  data: {
    metrics: any
    issues: any
    recentChecks: any[]
    activeIssues: any[]
  }
  activeBatches: Batch[]
  userRole: WorkerRole
  userId: string
}

export function QualityDashboard({ 
  data, 
  activeBatches, 
  userRole, 
  userId 
}: QualityDashboardProps) {
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QualityMetrics metrics={data.metrics} />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="checks" className="space-y-4">
        <TabsList>
          <TabsTrigger value="checks">Quality Checks</TabsTrigger>
          <TabsTrigger value="issues">Active Issues</TabsTrigger>
          <TabsTrigger value="history">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Perform Quality Check</CardTitle>
            </CardHeader>
            <CardContent>
              <QualityCheckForm 
                batches={activeBatches}
                userId={userId}
                onSubmit={() => {
                  // Refresh data after submission
                  window.location.reload()
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <ActiveIssues 
            issues={data.activeIssues}
            userRole={userRole}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <RecentChecks 
            checks={data.recentChecks}
            userRole={userRole}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}