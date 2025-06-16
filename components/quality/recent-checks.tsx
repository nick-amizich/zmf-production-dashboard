'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Database } from '@/types/database.types'

type WorkerRole = Database['public']['Enums']['worker_role']
type QualityStatus = Database['public']['Enums']['quality_status']

interface RecentChecksProps {
  checks: any[]
  userRole: WorkerRole
}

export function RecentChecks({ checks, userRole }: RecentChecksProps) {
  const getStatusIcon = (status: QualityStatus) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-theme-status-success" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'hold':
        return <Clock className="h-4 w-4 text-orange-500" />
      case 'critical':
        return <XCircle className="h-4 w-4 text-theme-status-error" />
      default:
        return null
    }
  }

  const getStatusColor = (status: QualityStatus) => {
    switch (status) {
      case 'good': return 'default'
      case 'warning': return 'secondary'
      case 'hold': return 'secondary'
      case 'critical': return 'destructive'
      default: return 'default'
    }
  }

  if (checks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-lg font-medium">No Recent Checks</p>
          <p className="text-sm text-muted-foreground">Quality checks will appear here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {checks.map((check) => (
        <Card key={check.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(check.overall_status)}
                <Badge variant={getStatusColor(check.overall_status)}>
                  {check.overall_status.toUpperCase()}
                </Badge>
                <Badge variant="outline">{check.stage}</Badge>
              </div>
              <span className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(check.created_at), { addSuffix: true })}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Checked by:</span>
                <span className="font-medium">{check.worker?.name || 'Unknown'}</span>
              </div>
              {check.batch && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Batch:</span>
                  <span className="font-medium">{check.batch.batch_number}</span>
                </div>
              )}
              {check.notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="mt-1">{check.notes}</p>
                </div>
              )}
              {check.checklist_data && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Checklist Items:</span>
                  <div className="flex gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-3 w-3 text-theme-status-success" />
                      {check.checklist_data.filter((item: any) => item.checked === true).length} Passed
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-theme-status-error" />
                      {check.checklist_data.filter((item: any) => item.checked === false).length} Failed
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}