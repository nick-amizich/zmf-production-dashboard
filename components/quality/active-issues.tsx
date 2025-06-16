'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { AlertCircle, CheckCircle, Clock, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Database } from '@/types/database.types'

import { logger } from '@/lib/logger'
type WorkerRole = Database['public']['Enums']['worker_role']
type QualityStatus = Database['public']['Enums']['quality_status']

interface ActiveIssuesProps {
  issues: any[]
  userRole: WorkerRole
  userId: string
}

export function ActiveIssues({ issues, userRole, userId }: ActiveIssuesProps) {
  const [selectedIssue, setSelectedIssue] = useState<any>(null)
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [isResolving, setIsResolving] = useState(false)

  const canResolve = (issue: any) => {
    return userRole === 'manager' || 
           userRole === 'admin' || 
           issue.assigned_to === userId
  }

  const handleResolve = async () => {
    if (!selectedIssue || !resolutionNotes.trim()) return
    
    setIsResolving(true)
    try {
      const response = await fetch(`/api/quality/issues/${selectedIssue.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolutionNotes }),
      })
      
      if (response.ok) {
        window.location.reload()
      }
    } catch (error) {
      logger.error('Error resolving issue:', error)
    } finally {
      setIsResolving(false)
    }
  }

  const getSeverityColor = (severity: QualityStatus) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'hold': return 'destructive'
      case 'warning': return 'secondary'
      default: return 'default'
    }
  }

  const getSeverityIcon = (severity: QualityStatus) => {
    switch (severity) {
      case 'critical': return <AlertCircle className="h-4 w-4" />
      case 'hold': return <Clock className="h-4 w-4" />
      default: return null
    }
  }

  if (issues.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle className="h-12 w-12 text-theme-status-success mb-4" />
          <p className="text-lg font-medium">No Active Issues</p>
          <p className="text-sm text-muted-foreground">All quality issues have been resolved</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4">
        {issues.map((issue) => (
          <Card key={issue.id} className="hover:bg-zinc-900/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(issue.severity)}>
                      {getSeverityIcon(issue.severity)}
                      {issue.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{issue.stage}</Badge>
                    <Badge variant="outline">{issue.category}</Badge>
                  </div>
                  <CardTitle className="text-base">{issue.description}</CardTitle>
                </div>
                {canResolve(issue) && (
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedIssue(issue)
                      setResolutionNotes('')
                    }}
                  >
                    Resolve
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {issue.reported_by_worker?.name || 'Unknown'}
                </div>
                <div>
                  {formatDistanceToNow(new Date(issue.created_at), { addSuffix: true })}
                </div>
                {issue.assigned_to_worker && (
                  <div className="flex items-center gap-1">
                    <span>Assigned to:</span>
                    <span className="font-medium">{issue.assigned_to_worker.name}</span>
                  </div>
                )}
              </div>
              {issue.batch && (
                <div className="mt-2 text-sm">
                  <span className="text-muted-foreground">Batch:</span> {issue.batch.batch_number}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedIssue} onOpenChange={() => setSelectedIssue(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Issue Description</p>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedIssue?.description}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Resolution Notes</label>
              <Textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how the issue was resolved..."
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedIssue(null)}>
                Cancel
              </Button>
              <Button 
                onClick={handleResolve} 
                disabled={!resolutionNotes.trim() || isResolving}
              >
                {isResolving ? 'Resolving...' : 'Resolve Issue'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}